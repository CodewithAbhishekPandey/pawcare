import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentModal = ({ vet, onClose, onPaymentSuccess }) => {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [step, setStep] = useState('form');

  useEffect(() => {
    loadRazorpayScript().then(setScriptLoaded);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handlePayment = useCallback(async () => {
    if (!petName.trim()) { setError("Please enter your pet's name"); return; }
    if (!issue.trim()) { setError('Please briefly describe the issue'); return; }
    if (!scriptLoaded) { setError('Payment gateway not loaded. Please refresh.'); return; }

    setError('');
    setLoading(true);
    setStep('paying');

    try {
      const { data } = await api.post('/consult/create-order', {
        vetId: vet._id,
        petName,
        petType,
        issue,
      });

      const { orderId, amount, currency, sessionId, key, vetName, isMock } = data.data;

      if (isMock) {
        await api.post('/consult/verify-payment', {
          sessionId,
          razorpay_order_id: orderId,
          razorpay_payment_id: 'mock_pay_' + Date.now(),
          razorpay_signature: 'mock_sig',
          isMock: true
        });
        setLoading(false);
        onPaymentSuccess({ sessionId, vet, petName, petType, issue });
        return;
      }

      const options = {
        key,
        amount,
        currency,
        name: 'PawCare',
        description: `Teleconsult with ${vetName}`,
        order_id: orderId,
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#0f4c5c' },
        handler: async (response) => {
          try {
            await api.post('/consult/verify-payment', {
              sessionId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onPaymentSuccess({ sessionId, vet, petName, petType, issue });
          } catch (verifyErr) {
            setError('Payment verification failed. Contact support.');
            setStep('form');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStep('form');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment order');
      setLoading(false);
      setStep('form');
    }
  }, [petName, petType, issue, vet, scriptLoaded, onPaymentSuccess]);

  const inputCls = "w-full bg-stone-50 border border-stone-200 text-paw-teal placeholder-stone-400 rounded-2xl px-4 py-3 focus:outline-none focus:border-paw-teal focus:ring-2 focus:ring-paw-teal/10 transition-all font-medium";

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-100"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-black text-paw-teal">Book Instant Consult</h2>
            <p className="text-stone-500 text-sm mt-0.5 font-medium">Video consultation · 15–30 minutes</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-paw-teal transition-colors flex items-center justify-center text-lg"
          >
            ✕
          </button>
        </div>

        {/* Vet summary */}
        <div className="mx-6 mt-5 p-4 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-paw-teal flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            {vet.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-paw-teal font-black">{vet.name}</p>
            <p className="text-stone-400 text-sm font-medium">{vet.specializations?.slice(0, 2).join(', ')}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-emerald-700 font-black text-lg">₹{vet.consultFee}</p>
            <p className="text-stone-400 text-xs font-medium">per session</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-stone-700 text-sm font-bold mb-1.5" htmlFor="modal-pet-name">
              Pet's Name *
            </label>
            <input
              id="modal-pet-name"
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Bruno"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-stone-700 text-sm font-bold mb-1.5" htmlFor="modal-pet-type">
              Pet Type *
            </label>
            <select
              id="modal-pet-type"
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className={inputCls}
            >
              {PET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-stone-700 text-sm font-bold mb-1.5" htmlFor="modal-issue">
              Describe the issue * <span className="text-stone-300 font-normal">({200 - issue.length} chars left)</span>
            </label>
            <textarea
              id="modal-issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value.slice(0, 200))}
              placeholder="e.g. My dog has been sneezing a lot and has watery eyes since yesterday..."
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
              <span className="text-red-600 text-sm font-medium">⚠️ {error}</span>
            </div>
          )}

          <button
            id="pay-consult-btn"
            onClick={handlePayment}
            disabled={loading || step === 'paying'}
            className="w-full py-4 bg-paw-teal hover:bg-opacity-90 text-white font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-paw-teal/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>🔒</span>
                <span>Pay ₹{vet.consultFee} & Connect</span>
              </>
            )}
          </button>

          <p className="text-center text-stone-400 text-xs font-medium">
            Secured by Razorpay · UPI, Cards, NetBanking accepted
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default PaymentModal;
