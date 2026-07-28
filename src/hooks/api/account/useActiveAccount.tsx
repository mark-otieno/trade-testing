import { useMemo } from 'react';
import { CurrencyIcon } from '@/components/currency/currency-icon';
import { addComma, getDecimalPlaces } from '@/components/shared';
import { useApiBase } from '@/hooks/useApiBase';
import { Balance } from '@deriv/api-types';
import { localize } from '@deriv-com/translations';

/** A custom hook that returns the account object for the current active account. */
const useActiveAccount = ({
    allBalanceData,
    directBalance,
}: {
    allBalanceData: Balance | null;
    directBalance?: string;
}) => {
    const { accountList, activeLoginid } = useApiBase();

    const activeAccount = useMemo(
        () => accountList?.find(account => account.loginid === activeLoginid),
        [activeLoginid, accountList]
    );

    const currentBalanceData = allBalanceData?.accounts?.[activeAccount?.loginid ?? ''];

    const modifiedAccount = useMemo(() => {
        return activeAccount
            ? {
                  ...activeAccount,
                  balance: currentBalanceData?.balance
                      ? addComma(currentBalanceData.balance.toFixed(getDecimalPlaces(currentBalanceData.currency)))
                      : directBalance
                        ? addComma(parseFloat(directBalance).toFixed(getDecimalPlaces(activeAccount.currency)))
                        : addComma(parseFloat('0').toFixed(getDecimalPlaces(activeAccount.currency))), //  [AI] Format zero with proper decimals
                  currencyLabel: activeAccount?.is_virtual ? localize('Demo') : activeAccount?.currency,
                  icon: (
                      <CurrencyIcon
                          currency={activeAccount?.currency?.toLowerCase()}
                          isVirtual={Boolean(activeAccount?.is_virtual)}
                      />
                  ),
                  isVirtual: Boolean(activeAccount?.is_virtual),
                  isActive: activeAccount?.loginid === activeLoginid,
              }
            : undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeAccount, activeLoginid, allBalanceData, directBalance]);

    return {
        /** User's current active account. */
        data: modifiedAccount,
    };
};

export default useActiveAccount;
