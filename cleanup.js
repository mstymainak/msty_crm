const { MongoClient } = require('mongodb');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const mongoUri = env.split('\n').find(line => line.startsWith('MONGODB_URI=')).split('=')[1].replace(/"/g, '').trim();

async function run() {
  const client = await MongoClient.connect(mongoUri);
  const db = client.db();
  
  const enquiries = await db.collection('enquiries').find({ message: /--- Note ---/ }).toArray();
  
  for (let e of enquiries) {
    const cleanMessage = e.message.split('--- Note ---')[0].trim();
    await db.collection('enquiries').updateOne({ _id: e._id }, { $set: { message: cleanMessage } });
  }
  
  console.log('Cleaned ' + enquiries.length + ' records');
  client.close();
}

run();
