// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faArrowAltCircleUp } from '@fortawesome/free-solid-svg-icons';
import { ButtonSubmit } from '@polkadotcloud/dashboard-ui';
import { useBalances } from 'contexts/Accounts/Balances';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { useTxFees } from 'contexts/TxFees';
import { useValidators } from 'contexts/Validators';
import type { Validator } from 'contexts/Validators/types';
import { Warning } from 'library/Form/Warning';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Title } from 'library/Modal/Title';
import { SubmitTx } from 'library/SubmitTx';
import { ValidatorList } from 'library/ValidatorList';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FooterWrapper, PaddingWrapper, WarningsWrapper } from '../Wrappers';
import { ListWrapper } from './Wrappers';

export const NominateFromFavorites = () => {
  const { t } = useTranslation('modals');
  const { consts, api } = useApi();
  const { activeAccount, accountHasSigner } = useConnect();
  const { getBondedAccount } = useBalances();
  const { config, setStatus: setModalStatus, setResize } = useModal();
  const { favoritesList } = useValidators();
  const { selectedActivePool, isNominator, isOwner } = useActivePools();
  const controller = getBondedAccount(activeAccount);
  const { txFeesValid } = useTxFees();

  const { maxNominations } = consts;
  const { bondFor, nominations } = config;
  const signingAccount = bondFor === 'pool' ? activeAccount : controller;

  // store filtered favorites
  const [availableFavorites, setAvailableFavorites] = useState<
    Array<Validator>
  >([]);

  // store selected favorites in local state
  const [selectedFavorites, setSelectedFavorites] = useState<Array<Validator>>(
    []
  );

  // store filtered favorites
  useEffect(() => {
    if (favoritesList) {
      const _availableFavorites = favoritesList.filter(
        (favorite: Validator) =>
          !nominations.find(
            (nomination: string) => nomination === favorite.address
          ) && !favorite.prefs.blocked
      );
      setAvailableFavorites(_availableFavorites);
    }
  }, []);

  // calculate active + selected favorites
  const nominationsToSubmit = nominations.concat(
    selectedFavorites.map((favorite: Validator) => favorite.address)
  );

  // valid to submit transaction
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    setResize();
  }, [selectedFavorites]);

  // ensure selected list is within limits
  useEffect(() => {
    setValid(
      nominationsToSubmit.length > 0 &&
        maxNominations.isGreaterThan(nominationsToSubmit.length) &&
        selectedFavorites.length > 0
    );
  }, [selectedFavorites]);

  const batchKey = 'nominate_from_favorites';

  const onSelected = (provider: any) => {
    const { selected } = provider;
    setSelectedFavorites(selected);
  };

  const totalAfterSelection = nominations.length + selectedFavorites.length;
  const overMaxNominations =
    maxNominations.isLessThanOrEqualTo(totalAfterSelection);

  // tx to submit
  const getTx = () => {
    let tx = null;
    if (!valid || !api) {
      return tx;
    }

    const targetsToSubmit = nominationsToSubmit.map((item: any) =>
      bondFor === 'pool'
        ? item
        : {
            Id: item,
          }
    );

    if (bondFor === 'pool') {
      tx = api.tx.nominationPools.nominate(
        selectedActivePool?.id,
        targetsToSubmit
      );
    } else {
      tx = api.tx.staking.nominate(targetsToSubmit);
    }
    return tx;
  };

  const { submitTx, submitting } = useSubmitExtrinsic({
    tx: getTx(),
    from: signingAccount,
    shouldSubmit: valid,
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {},
  });

  return (
    <>
      <Title title={t('nominateFavorites')} />
      <PaddingWrapper>
        <div style={{ marginBottom: '1rem', width: '100%' }}>
          {!accountHasSigner(signingAccount) ? (
            <WarningsWrapper>
              <Warning
                text={`${
                  bondFor === 'nominator'
                    ? t('youMust', { context: 'controller' })
                    : t('youMust', { context: 'account' })
                }`}
              />
            </WarningsWrapper>
          ) : null}
        </div>
        <ListWrapper>
          {availableFavorites.length > 0 ? (
            <ValidatorList
              bondFor="nominator"
              validators={availableFavorites}
              batchKey={batchKey}
              title={t('favoriteNotNominated')}
              selectable
              selectActive
              selectToggleable={false}
              onSelected={onSelected}
              showMenu={false}
              inModal
              allowMoreCols
              refetchOnListUpdate
            />
          ) : (
            <h3>{t('noFavoritesAvailable')}</h3>
          )}
        </ListWrapper>
        <FooterWrapper>
          <h3
            className={
              selectedFavorites.length === 0 ||
              maxNominations.isLessThanOrEqualTo(nominationsToSubmit.length)
                ? ''
                : 'active'
            }
          >
            {selectedFavorites.length > 0
              ? overMaxNominations
                ? `${t('willSurpass', {
                    maxNominations: maxNominations.toString(),
                  })}`
                : `${t('addingFavorite', {
                    count: selectedFavorites.length,
                  })}`
              : `${t('noFavoritesSelected')}`}
          </h3>
        </FooterWrapper>
      </PaddingWrapper>
      <SubmitTx
        fromController={bondFor === 'nominator'}
        buttons={[
          <ButtonSubmit
            key="button_submit"
            text={`${submitting ? t('submitting') : t('submit')}`}
            iconLeft={faArrowAltCircleUp}
            iconTransform="grow-2"
            onClick={() => submitTx()}
            disabled={
              !valid ||
              submitting ||
              (bondFor === 'pool' && !isNominator() && !isOwner()) ||
              !accountHasSigner(signingAccount) ||
              !txFeesValid
            }
          />,
        ]}
      />
    </>
  );
};
