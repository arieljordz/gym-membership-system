import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { peso, formatDate } from "../../utils/format.js";
import { PAYMENT_METHODS } from "../../utils/constants.js";

export default function Plans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [promos, setPromos] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [showPay, setShowPay] = useState(false);
  const [pay, setPay] = useState({ method: "gcash", referenceNumber: "", proof: null });
  const [submitting, setSubmitting] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);

  const load = async () => {
    const [p, pr] = await Promise.all([api.get("/plans"), api.get("/promos/active")]);
    setPlans(p.data.data);
    setPromos(pr.data.data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const promoForPlan = (planId) => {
    const applicable = promos.filter(
      (pr) => !pr.appliesToPlans?.length || pr.appliesToPlans.some((x) => (x._id || x) === planId)
    );
    return applicable.sort((a, b) => b.discountPercentage - a.discountPercentage)[0] || null;
  };

  const subscribe = async (plan) => {
    setSubscribingId(plan._id);
    try {
      const { data } = await api.post("/subscriptions", { planId: plan._id });
      setSubscription(data.data);
      setPay({ method: "gcash", referenceNumber: "", proof: null });
      setShowPay(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubscribingId(null);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!pay.proof) {
      toast.error("Please upload proof of payment");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("subscriptionId", subscription._id);
      fd.append("amount", subscription.finalPrice);
      fd.append("method", pay.method);
      fd.append("referenceNumber", pay.referenceNumber);
      fd.append("proof", pay.proof);
      await api.post("/payments", fd);
      toast.success("Payment submitted! Await admin approval.");
      setShowPay(false);
      setSubscription(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h4 className="fw-bold mb-1">Membership Plans</h4>
      <p className="text-muted">Choose a plan. Active promos are applied automatically.</p>

      {promos.length > 0 && (
        <div className="alert alert-warning d-flex flex-wrap gap-2 align-items-center">
          <i className="bi bi-tags-fill" />
          <strong className="me-1">Active Promos:</strong>
          {promos.map((pr) => (
            <span key={pr._id} className="badge bg-danger">
              {pr.promoName} - {pr.discountPercentage}% off
            </span>
          ))}
        </div>
      )}

      <div className="row g-4">
        {plans.map((plan) => {
          const promo = promoForPlan(plan._id);
          const discounted = promo ? plan.price - (plan.price * promo.discountPercentage) / 100 : plan.price;
          return (
            <div className="col-md-6 col-lg-4" key={plan._id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">{plan.name}</h5>
                    <span className="badge bg-secondary text-uppercase">{plan.type}</span>
                  </div>
                  <p className="text-muted small">{plan.description}</p>
                  <div className="my-2">
                    {promo && (
                      <div className="text-decoration-line-through text-muted small">{peso(plan.price)}</div>
                    )}
                    <div className="h3 fw-bold mb-0">{peso(discounted)}</div>
                    <small className="text-muted">for {plan.durationDays} day(s)</small>
                    {promo && <div className="badge bg-danger mt-1">{promo.discountPercentage}% OFF - {promo.promoName}</div>}
                  </div>
                  <ul className="list-unstyled small flex-grow-1">
                    {(plan.features || []).map((f, i) => (
                      <li key={i}>
                        <i className="bi bi-check-circle text-success me-2" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-warning w-100 mt-2" disabled={subscribingId === plan._id} onClick={() => subscribe(plan)}>
                    {subscribingId === plan._id ? "Processing..." : "Subscribe"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showPay && subscription && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complete Your Payment</h5>
                <button className="btn-close" onClick={() => setShowPay(false)} />
              </div>
              <div className="modal-body">
                <div className="alert alert-light border small mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Plan</span>
                    <strong>{subscription.plan?.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Base Price</span>
                    <span>{peso(subscription.basePrice)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Discount</span>
                    <span>- {peso(subscription.discountAmount)}</span>
                  </div>
                  <hr className="my-1" />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total Due</span>
                    <span>{peso(subscription.finalPrice)}</span>
                  </div>
                </div>

                <form onSubmit={submitPayment} id="payform">
                  <div className="mb-2">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Reference Number</label>
                    <input className="form-control" value={pay.referenceNumber} onChange={(e) => setPay({ ...pay, referenceNumber: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Proof of Payment (image)</label>
                    <input type="file" accept="image/*" className="form-control" onChange={(e) => setPay({ ...pay, proof: e.target.files[0] })} required />
                  </div>
                </form>
                <p className="small text-muted mb-0">Send payment to GCash 0917-000-0000, then upload the screenshot.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPay(false)}>
                  Cancel
                </button>
                <button form="payform" className="btn btn-warning" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
