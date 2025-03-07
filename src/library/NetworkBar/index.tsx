// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from 'contexts/Api';
import { usePlugins } from 'contexts/Plugins';
import { useOutsideAlerter } from 'library/Hooks';
import { usePrices } from 'library/Hooks/usePrices';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from 'Utils';
import { Status } from './Status';
import { NetworkInfo, Separator, Summary, Wrapper } from './Wrappers';

export const NetworkBar = () => {
  const { t } = useTranslation('library');
  const { plugins } = usePlugins();
  const { network, isLightClient } = useApi();
  const prices = usePrices();

  // currently not in use
  const [open, setOpen] = useState(false);

  // handle expand transitions
  const variants = {
    minimised: {
      height: '2.5rem',
    },
    maximised: {
      height: '155px',
    },
  };

  const animate = open ? 'maximised' : 'minimised';
  const ref = useRef(null);

  const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL;
  const DISCLAIMER_URL = import.meta.env.VITE_DISCLAIMER_URL;
  const ORGANISATION = import.meta.env.VITE_ORGANISATION;

  const [networkName, setNetworkName] = useState<string>(
    capitalizeFirstLetter(network.name)
  );

  useOutsideAlerter(
    ref,
    () => {
      setOpen(false);
    },
    ['igignore-network-info-toggle']
  );

  useEffect(() => {
    setNetworkName(
      `${capitalizeFirstLetter(network.name)}${isLightClient ? ` Light` : ``}`
    );
  }, [network.name, isLightClient]);

  return (
    <Wrapper
      ref={ref}
      initial={false}
      animate={animate}
      transition={{
        duration: 0.4,
        type: 'spring',
        bounce: 0.25,
      }}
      variants={variants}
    >
      <Summary>
        <section>
          <network.brand.icon className="network_icon" />
          <p>{ORGANISATION === undefined ? networkName : ORGANISATION}</p>
          <Separator />
          {PRIVACY_URL !== undefined ? (
            <p>
              <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
                {t('privacy')}
              </a>
            </p>
          ) : (
            <Status />
          )}
          {DISCLAIMER_URL !== undefined && (
            <>
              <Separator />
              <p>
                <a href={DISCLAIMER_URL} target="_blank" rel="noreferrer">
                  {t('disclaimer')}
                </a>
              </p>
            </>
          )}
        </section>
        <section>
          <div className="hide-small">
            {plugins.includes('binance_spot') && (
              <>
                <div className="stat">
                  <span
                    className={`change${
                      prices.change < 0
                        ? ' neg'
                        : prices.change > 0
                        ? ' pos'
                        : ''
                    }`}
                  >
                    {prices.change < 0 ? '' : prices.change > 0 ? '+' : ''}
                    {prices.change}%
                  </span>
                </div>
                <div className="stat">
                  1 {network.api.unit} / {prices.lastPrice} USD
                </div>
              </>
            )}
          </div>
        </section>
      </Summary>

      <NetworkInfo />
    </Wrapper>
  );
};
