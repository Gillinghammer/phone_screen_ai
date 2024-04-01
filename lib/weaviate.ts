import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

const client: WeaviateClient = weaviate.client({
        scheme: 'https',
        host: process.env.WEAVIATE_URL || 'default_endpoint',  // Replace 'default_endpoint' with your default endpoint
        apiKey: new ApiKey(process.env.WEAVIATE_KEY || 'weaviate_key'),
        headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '' },
    });

export default client;
