import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: '',
    brokers: [process.env.KAFKA_BROKER]
})


const producer = kafka.producer()

const consumer = kafka.consumer({
    groupId: 'my-group'
})

const inittializeKafka = async () => {

    try{
        await producer.connect()
        await consumer.connect()

        console.log("Kafka connected")

    }catch(error){
        console.log("Error in initializeKafka: ", error.message)
    }
}

export {producer, consumer, inittializeKafka}


