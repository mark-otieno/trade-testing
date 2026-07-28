import { getAccountLimits } from '../../../../components/shared/utils/common-data';

export default class AccountLimits {
    constructor(store) {
        this.ws = store.ws;
    }
    // eslint-disable-next-line default-param-last
    getStakePayoutLimits(currency = 'AUD', landing_company_shortcode = 'svg', selected_market) {
        // Use common data instead of duplicating here
        return getAccountLimits(currency, landing_company_shortcode, selected_market);
    }
}
