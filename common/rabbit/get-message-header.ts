export default function getMessageHeader(message, header) {
  const value = (!!message && !!message.properties && !!message.properties.headers && message.properties.headers[header]);

  return value ? value : null;
};