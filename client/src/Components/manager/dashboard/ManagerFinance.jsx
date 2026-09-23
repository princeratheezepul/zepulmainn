import React from 'react';
import FinanceSection from '../../dashboard/FinanceSection';

const ManagerFinance = ({ platform }) => (
  <FinanceSection
    jobs={platform.jobs}
    loading={platform.loading}
    eyebrow="Finance"
    title="Revenue & Partner Payouts"
    sub="Track GST, TDS, net pay and partner share"
  />
);

export default ManagerFinance;
