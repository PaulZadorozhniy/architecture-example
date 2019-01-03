export default function generateAmqpUrl(hosts, username, password) {
  const hostsList = hosts.split(',');
  const baseUrl = `amqp://${encodeURIComponent(username)}:${encodeURIComponent(password)}`;
  
  if (Array.isArray(hostsList)) {
    const index = Math.floor(Math.random() * hostsList.length);

    return `${baseUrl}@${hostsList[index]}`;
  }

  return `${baseUrl}@${hostsList}`;
};