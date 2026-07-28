import React from 'react';
import { observer } from 'mobx-react-lite';
import { AccountSwitcher as UIAccountSwitcher } from '@deriv-com/ui';
import { TAccountSwitcher } from './common/types';
import './account-switcher.scss';

const AccountSwitcher = observer(({ activeAccount }: TAccountSwitcher) => {
    return (
        activeAccount && (
            <UIAccountSwitcher
                buttonClassName='account-switcher-fixed'
                activeAccount={activeAccount}
                isDisabled={true} // Force disabled to prevent interactions
            />
        )
    );
});

export default AccountSwitcher;
