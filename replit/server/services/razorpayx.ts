import axios from "axios";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID!;
const keySecret = process.env.RAZORPAY_KEY_SECRET!;
const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER!;

const api = axios.create({
	baseURL: "https://api.razorpay.com/v1",
	auth: { username: keyId, password: keySecret },
	timeout: 15000,
});

export async function createFundAccount(beneficiary: { name: string; ifsc?: string; account?: string; upi?: string; email?: string; contact?: string; }) {
	// Minimal: use contact + fund_account create; caller picks mode
	const contact = await api.post("/contacts", {
		name: beneficiary.name,
		email: beneficiary.email,
		contact: beneficiary.contact,
		type: "customer",
	});

	const mode = process.env.RAZORPAYX_FUND_ACCOUNT_MODE || 'upi';
	const fund = await api.post("/fund_accounts", {
		contact_id: contact.data.id,
		account_type: mode === 'upi' ? 'vpa' : 'bank_account',
		[mode === 'upi' ? 'vpa' : 'bank_account']: mode === 'upi'
			? { address: beneficiary.upi }
			: { ifsc: beneficiary.ifsc, account_number: beneficiary.account },
	});

	return { contactId: contact.data.id, fundAccountId: fund.data.id };
}

export async function createPayout(params: { fundAccountId: string; amountPaise: number; currency?: string; narration?: string; referenceId?: string; }) {
	const res = await api.post("/payouts", {
		account_number: accountNumber,
		fund_account_id: params.fundAccountId,
		amount: params.amountPaise,
		currency: params.currency || 'INR',
		mode: process.env.RAZORPAYX_FUND_ACCOUNT_MODE || 'upi',
		purpose: 'payout',
		narration: params.narration || 'Eco payout',
		reference_id: params.referenceId,
	});
	return res.data;
}

export function computeWebhookSignature(body: string) {
	const secret = process.env.RAZORPAYX_WEBHOOK_SECRET!;
	return crypto.createHmac('sha256', secret).update(body).digest('hex');
}