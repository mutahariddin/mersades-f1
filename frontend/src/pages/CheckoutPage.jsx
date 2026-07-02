import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CheckoutPage() {
	const { items, total, fmt, clearCart } = useCart();
	const { t, localize } = useLanguage();
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: '', email: '', address: '', city: '', postal: '', country: '' });
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!items.length) return alert(t('checkout.emptyCartAlert'));
		setLoading(true);
		try {
			// Call backend checkout route — adapt URL to your API
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cart: items, customer: form, total }),
			});
			if (!res.ok) throw new Error(t('checkout.checkoutFailed'));
			const data = await res.json();
			clearCart();
			navigate('/success', { replace: true, state: data });
		} catch (err) {
			console.error(err);
			alert(t('checkout.checkoutErrorAlert'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<main style={{ padding: 24 }}>
			<h1 style={{ marginBottom: 18 }}>{t('checkout.title')}</h1>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
				<form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: 16, borderRadius: 8 }}>
					<h2 style={{ marginBottom: 12 }}>{t('checkout.shippingContact')}</h2>
					<div style={{ display: 'grid', gap: 10 }}>
						<input name="name" value={form.name} onChange={handleChange} placeholder={t('checkout.fullName')} className="input" />
						<input name="email" value={form.email} onChange={handleChange} placeholder={t('checkout.email')} className="input" />
						<input name="address" value={form.address} onChange={handleChange} placeholder={t('checkout.address')} className="input" />
						<div style={{ display: 'flex', gap: 10 }}>
							<input name="city" value={form.city} onChange={handleChange} placeholder={t('checkout.city')} className="input" />
							<input name="postal" value={form.postal} onChange={handleChange} placeholder={t('checkout.postal')} className="input" />
						</div>
						<input name="country" value={form.country} onChange={handleChange} placeholder={t('checkout.country')} className="input" />
					</div>
					<div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
						<button type="submit" className="btn btn-teal" disabled={loading}>{loading ? t('checkout.processing') : t('checkout.placeOrder')}</button>
						<button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>{t('checkout.back')}</button>
					</div>
				</form>

				<aside style={{ background: 'var(--surface2)', padding: 16, borderRadius: 8, height: 'fit-content' }}>
					<h2 style={{ marginBottom: 12 }}>{t('checkout.orderSummary')}</h2>
					{items.length === 0 ? (
						<div style={{ color: 'var(--muted)' }}>{t('checkout.cartEmpty')}</div>
					) : (
						<div style={{ display: 'grid', gap: 12 }}>
							{items.map(i => (
								<div key={i._key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
									<div style={{ minWidth: 0 }}>
										<div style={{ fontWeight: 600 }}>{localize(i, 'name', 'nameRu')}</div>
										<div style={{ color: 'var(--muted)', fontSize: 13 }}>{i.size ? `${t('cart.size')}: ${i.size}` : null}</div>
									</div>
									<div style={{ textAlign: 'right' }}>
										<div>{fmt(i.price)} × {i.quantity}</div>
										<div style={{ fontWeight: 600 }}>{fmt(i.price * i.quantity)}</div>
									</div>
								</div>
							))}
							<hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
							<div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>{t('checkout.total')} <span>{fmt(total)}</span></div>
						</div>
					)}
				</aside>
			</div>
		</main>
	);
}
