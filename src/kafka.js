// import the `Kafka` instance from the kafkajs library
import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";

// the client ID lets kafka know who's producing the messages
const clientId = "nodejs";
// we can define the list of brokers in the cluster
const brokers = [process.env.KAFKA_HOST ?? "localhost:9092"];
// this is the topic to which we want to write messages
const topic = process.env.KAFKA_TOPIC ?? "FirstTopic";

// initialize a new kafka client and initialize a producer from it
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();

// we define an async function that writes a new message each second
export const produce = async (operation, target, payload) => {
  await producer.connect();

  const key = uuidv4();
  const message = {
    msgId: key,
    msgTS: new Date(),
    operation,
    target,
    payload,
  };

  try {
    // send a message to the configured topic with
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (err) {
    console.error("could not write message " + err);
  }

  await producer.disconnect();
};
