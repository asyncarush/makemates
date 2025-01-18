import pika
import json
import time

from models.paraphrase import get_suggestions_from_model

# Connect to RabbitMQ
credentials = pika.PlainCredentials('user', 'RkrLMHwnOcsaf7eA')

parameters = pika.ConnectionParameters(
    host='192.168.49.2',
    port=31521,
    credentials=credentials
)

def process_caption(caption):
    """return the model generated suggestions"""
    suggestions = get_suggestions_from_model(caption)
    return suggestions


def callback(ch, method, properties, body):
    try:
        # Parse request
        request = json.loads(body.decode())
        print(f" [x] Processing request from user {request['userId']}: {request['caption']}")

        # Process the caption
        result = process_caption(request['caption'])

        # Prepare response
        response = {
            'original_caption': request['caption'],
            'suggested_caption': result,
            'processed_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        # Send response back
        ch.basic_publish(
            exchange='',
            routing_key=properties.reply_to,
            body=json.dumps(response),
            properties=pika.BasicProperties(
                correlation_id=properties.correlation_id
            )
        )

        # Acknowledge the message
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"Error processing message: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

try:
    # Create connection
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    
    # Declare request queue
    channel.queue_declare(queue='caption-requests', durable=True)
    
    # Set up consumer with prefetch count of 1 for fair dispatch
    channel.basic_qos(prefetch_count=1)
    
    channel.basic_consume(
        queue='caption-requests',
        on_message_callback=callback
    )

    print(' [*] AI Service waiting for caption requests. To exit press CTRL+C')
    channel.start_consuming()

except KeyboardInterrupt:
    print('Shutting down AI service...')
    if connection and not connection.is_closed:
        connection.close()
except Exception as e:
    print(f"An error occurred: {e}")
    if connection and not connection.is_closed:
        connection.close()