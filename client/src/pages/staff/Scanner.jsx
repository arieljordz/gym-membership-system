import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Html5Qrcode } from "html5-qrcode";
import api, { getErrorMessage } from "../../api/axios.js";
import { SCAN_RESULT } from "../../utils/constants.js";
import { formatDate } from "../../utils/format.js";

export default function Scanner() {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const scannerRef = useRef(null);
  const regionId = "qr-reader";

  const handleScan = async (text) => {
    try {
      const { data } = await api.post("/attendance/scan", { qr: text });
      setResult(data.data);
      if (data.data.access) toast.success(data.message);
      else toast.warning(data.message);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      /* ignore */
    }
    setScanning(false);
  };

  const startCamera = async () => {
    setScanning(true);
    const html5 = new Html5Qrcode(regionId);
    scannerRef.current = html5;
    try {
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await stopCamera();
          await handleScan(decodedText);
        },
        () => {}
      );
    } catch {
      toast.error("Unable to access camera. Use manual input below.");
      setScanning(false);
    }
  };

  useEffect(() => () => {
    stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitManual = async (e) => {
    e.preventDefault();
    if (!manual.trim()) return;
    await handleScan(manual.trim());
  };

  const meta = result ? SCAN_RESULT[result.result] : null;

  return (
    <div>
      <h4 className="fw-bold mb-3">Gym Entry Scanner</h4>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">Scan QR Code</div>
            <div className="card-body">
              <div id={regionId} style={{ width: "100%", minHeight: scanning ? 280 : 0 }} />
              <div className="d-flex gap-2 mt-2">
                {!scanning ? (
                  <button className="btn btn-warning" onClick={startCamera}>
                    <i className="bi bi-camera-video me-1" /> Start Camera
                  </button>
                ) : (
                  <button className="btn btn-outline-danger" onClick={stopCamera}>
                    <i className="bi bi-stop-circle me-1" /> Stop
                  </button>
                )}
              </div>

              <hr />
              <form onSubmit={submitManual}>
                <label className="form-label small text-muted">
                  Manual entry (paste QR JSON payload for testing)
                </label>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder='{"memberId":"...","subscriptionId":"...","code":"GYM-...","sig":"..."}'
                />
                <button className="btn btn-outline-secondary btn-sm">Validate Manually</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent fw-semibold">Result</div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              {!result && <p className="text-muted my-5">Scan a QR code to validate membership.</p>}
              {result && meta && (
                <>
                  <i className={`bi ${meta.icon} text-${meta.color}`} style={{ fontSize: "3.5rem" }} />
                  <h4 className={`text-${meta.color} mt-2`}>{meta.label}</h4>
                  {result.member && (
                    <h5 className="mb-1">
                      {result.member.firstName} {result.member.lastName}
                    </h5>
                  )}
                  {result.access && result.action && (
                    <span className="badge bg-success text-uppercase">{result.action}</span>
                  )}
                  {result.expiryDate && (
                    <p className="text-muted small mt-2 mb-0">Expires: {formatDate(result.expiryDate)}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
