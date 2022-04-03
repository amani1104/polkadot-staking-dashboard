// Copyright 2022 @rossbulat/polkadot-staking-experience authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { OpenAssistantIcon } from '../../library/OpenAssistantIcon';
import { useNavigate } from 'react-router-dom';
import { URI_PREFIX } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight as faGo } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { NominateWrapper } from './Wrappers';

export const ValidatorOptions = () => {

  const navigate = useNavigate();
  const handleBrowseValidatorsClick = useCallback(() => navigate(URI_PREFIX + '/validators', { replace: true }), [navigate]);

  return (
    <>
      <h3>Your Nominations <OpenAssistantIcon page="stake" title="Nominations" /></h3>
      <NominateWrapper style={{ marginTop: '0.5rem' }}>
        <motion.button whileHover={{ scale: 1.01 }} onClick={handleBrowseValidatorsClick}>
          <h2>Manual Selection</h2>
          <p>Manually browse and nominate validators from the validator list.</p>
          <div className='foot'>
            <p className='go'>
              Browse Validators
              <FontAwesomeIcon
                icon={faGo}
                transform="shrink-2"
                style={{ marginLeft: '0.5rem' }}
              />
            </p>
          </div>
        </motion.button>
        <motion.button whileHover={{ scale: 1.01 }}>
          <h2>Smart Nominate</h2>
          <p>Nominate the most suited validators based on your requirements.</p>
          <div className='foot'>
            <p className='go'>
              Start <FontAwesomeIcon
                icon={faGo}
                transform="shrink-2"
                style={{ marginLeft: '0.5rem' }}
              />
            </p>
          </div>
        </motion.button>
      </NominateWrapper>
    </>
  )
}

export default ValidatorOptions;