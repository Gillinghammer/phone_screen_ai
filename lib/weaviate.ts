import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

const client: WeaviateClient = weaviate.client({
        scheme: 'https',
        host: process.env.WEAVIATE_URL,  // Replace with your endpoint
        apiKey: new ApiKey(process.env.WEAVIATE_KEY),
        headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY },
    });

export default client;
