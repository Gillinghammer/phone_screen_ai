import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { pathwayId } = req.query;

  if (!pathwayId) {
    return res.status(400).json({ message: 'Pathway ID is required' });
  }

  try {
    const response = await axios.get(`https://api.bland.ai/v1/convo_pathway/${pathwayId}`, {
      headers: {
        'authorization': process.env.BLAND_API_KEY
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching pathway:', error);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
