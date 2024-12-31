import QuickBooks from "node-quickbooks";

let qbo = new QuickBooks(
	"ABPsAQVR4ZAW8eK0lJ1YHVeSf4zTunjo3MHFqlEExoh5qfho81", // consumerKey
	"uL37oMDdZ4b1tAMRygRXFeendHucbpXt6l9Q5Oo3", // consumerSecret
	"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..A4xd5UTekT2HJ6QRoQUgBg.7hpqhZkCd-PVAzxI2JZLbQvQ37e1VRvIG_0DJGpf56EZJOhPtr5JF_86m8QcR7anbxz2_-7EbRG4iLxv3D3afa-zJMadGdyIFNMYC2T9ocvqqO6t0dUfRT5qT6qrWbSJjh90eCfw9ATpX-LC9tIueiCVD2n_97B55JGsZInHP8-vYkG1KS1C01yAdaQ_OkdNI2UBk6TvvXbb34N2ljum-c0Bv8cl3wht7Hput_FKL-r6jUSGpfCv5bmN4Y3ggdROUlITc3Pc7La8EXH_HTqoLZn87HXVhRaLgQ2Rsm_4bV852vL_ctjdks_XF_eHC6iyN1Un5_pAC8gOgThetHeKRS6adi1QiT_dQ8mBjml1Po7K8g9d7X0RrLnoKVKDGy4cJ4QbWSLJLtaT4H0rhvrGjdgGidyU9ytxX-TssZYDvgeIcT3F4pSgTmLBgILeQ8uupjCBrdVfQg2-4BqN3RSmtco41sO0FsZ3nK2exjGJrLPjEHw708CUwsJFHTeibk3GIvIHTBQRREa5-yj7AfjzaRiQ47fgwbqjtAvrpEeCFHahpdsVDLqkEuWvwuMDXFQX97om_AocxiU3SaztHMGSaO4oAS8NMbQHt1PNGBOeR2qHx7K7zc_CEbtOwsf4fPpSsQ5bzQTE7IofdDpQYmy0_g3mco6JF6iMEl64rnPgTCLwYwis5Ak4Jarps5zkCgVRI4a5ESdL6GVi2TDZg3iPqz57nCUYOLXzc5wzAQXoKOGD-5CfFeO93IJBb9wVlxgqLNeq16VlQkVZP6Yc52rmdSFF4hOFH-CHzCrWYjHys8MoBruVE12KZzSt7XyfxeYUXMFjptNG6lTAOSDzXlVR0g.4-HdBkaaFpnHSpyYDqeRWw", // oauthToken
	null, // tokenSecret (set to null for OAuth 2.0)
	"9341453554481946", // realmId
	true, // use the sandbox environment
	false, // no debug logging
	null, // no minorversion
	"2.0" // OAuth version
);

qbo.findCustomers(
	{
		fetchAll: true,
	},
	function (e, response) {
		const customers = response.QueryResponse.Customer;

		console.log(customers);
	}
);
