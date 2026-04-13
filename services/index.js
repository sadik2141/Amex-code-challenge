require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');
const CircuitBreaker = require('../utils/circuitBreaker');
const ExponentialBackoff = require('../utils/exponentialBackoff');

// Create instances for the /addEvent endpoint
const breaker = new CircuitBreaker();
const backoff = new ExponentialBackoff();

fastify.get('/getUsers', async (request, reply) => {
    const resp = await fetch('http://event.com/getUsers');
    const data = await resp.json();
    reply.send(data); 
});

fastify.post('/addEvent', async (request, reply) => {
  try {
    // Step 1: Check if circuit breaker allows request
    if (!breaker.canMakeRequest()) {
      return reply.status(503).send({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Service is temporarily down. Unable to add event. Please try again later.'
      });
    }

    // Step 2: Try to add event with retries
    const data = await backoff.execute(async () => {
      const resp = await fetch('http://event.com/addEvent', {
        method: 'POST',
        body: JSON.stringify({
          id: new Date().getTime(),
          ...request.body
        })
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      return await resp.json();
    });

    // Step 3: Success! Reset circuit breaker
    breaker.recordSuccess();
    reply.send(data);

  } catch (err) {
    // Step 4: Failed - record failure in circuit breaker
    breaker.recordFailure();
    
    fastify.log.error(err);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Failed to add event. Please try again later.'
    });
  }
});

fastify.get('/getEvents', async (request, reply) => {  
    const resp = await fetch('http://event.com/getEvents');
    const data = await resp.json();
    reply.send(data);
});

fastify.get('/getEventsByUserId/:id', async (request, reply) => {
    const { id } = request.params;
    const user = await fetch('http://event.com/getUserById/' + id);
    const userData = await user.json();
    const userEvents = userData.events;
    
    // Fetch all events in parallel using Promise.all instead of sequential fetches
    const eventPromises = userEvents.map(eventId =>
        fetch('http://event.com/getEventById/' + eventId)
            .then(res => res.json())
    );
    
    const eventArray = await Promise.all(eventPromises);
    reply.send(eventArray);
});

fastify.listen({ port: process.env.PORT || 3000 }, (err) => {
    listenMock();
    if (err) {
      fastify.log.error(err);
      process.exit();
    }
    
    const env = process.env.NODE_ENV || 'development';
    const port = process.env.PORT || 3000;
    
    console.log(` Server running in ${env} mode on port ${port}`);
    if (env === 'production') {
      console.log(' Production mode - ensure all environment variables are set');
    }
});
