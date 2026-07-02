const getSalesforceErrorEntry = (error) => {
  const data = error.response?.data;
  if (!data) return null;
  if (Array.isArray(data)) return data[0] || null;
  if (typeof data === 'object') return data;
  if (typeof data === 'string') return { message: data };
  return null;
};

const formatSalesforceError = (error, fallback) => {
  const sfError = getSalesforceErrorEntry(error);
  if (!sfError) return fallback;

  let errorMessage = sfError.message || fallback;
  const errorCode = sfError.errorCode || '';

  if (errorMessage.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION')) {
    errorMessage = errorMessage
      .replace(/FIELD_CUSTOM_VALIDATION_EXCEPTION,?\s*/i, '')
      .split(':')[0]
      .trim();
  } else if (
    errorCode === 'DUPLICATES_DETECTED'
    || errorCode === 'DUPLICATE_VALUE'
    || /duplicate/i.test(errorMessage)
  ) {
    errorMessage = errorMessage.split(':')[0].trim();
  } else if (errorCode === 'INVALID_EMAIL_ADDRESS') {
    errorMessage = errorMessage.split(':')[0].trim();
  }

  return errorMessage || fallback;
};

const isSalesforceClientError = (error) => {
  const status = error.response?.status;
  if (status >= 400 && status < 500) return true;

  const sfError = getSalesforceErrorEntry(error);
  if (!sfError) return false;

  const errorCode = sfError.errorCode || '';
  const message = sfError.message || '';

  return (
    errorCode === 'FIELD_CUSTOM_VALIDATION_EXCEPTION'
    || message.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION')
    || errorCode === 'DUPLICATES_DETECTED'
    || errorCode === 'DUPLICATE_VALUE'
    || errorCode === 'INVALID_EMAIL_ADDRESS'
    || /duplicate/i.test(message)
  );
};

module.exports = {
  formatSalesforceError,
  isSalesforceClientError,
};
