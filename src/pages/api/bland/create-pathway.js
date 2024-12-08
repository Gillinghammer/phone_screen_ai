import axios from 'axios';
import { NODE_CONFIGS, createEdges } from '../../../lib/config/bland';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, description, questions, jobTitle, jobId } = req.body;

  if (!name || !description || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    // Step 1: Create empty pathway
    console.log('Creating empty pathway...');
    const createResponse = await axios.post('https://api.bland.ai/v1/pathway/create', 
      { 
        name,
        description
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.BLAND_API_KEY
        }
      }
    );

    const pathwayId = createResponse.data.pathway_id;
    console.log(`Empty pathway created with ID: ${pathwayId}`);

    // Create nodes using config
    const startNode = NODE_CONFIGS.start;
    const readyNode = NODE_CONFIGS.ready(jobTitle);
    const questionNodes = questions.map((question, index) => NODE_CONFIGS.question(question, index));
    const endNode = NODE_CONFIGS.end;

    // Combine all nodes
    const nodes = [startNode, readyNode, ...questionNodes, endNode];

    // Create edges using config
    const edges = createEdges({ startNode, readyNode, questionNodes, endNode });

    // Step 2: Update the pathway with nodes and edges
    console.log('Updating pathway with nodes and edges...');
    const updateResponse = await axios.post(
      `https://api.bland.ai/v1/pathway/${pathwayId}`,
      {
        name,
        description,
        nodes,
        edges
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.BLAND_API_KEY
        }
      }
    );

    // Update the job in the database with the new pathwayId
    await prisma.job.update({
      where: { id: jobId },
      data: { blandPathwayId: pathwayId }
    });

    res.status(200).json({
      status: 'success',
      pathway_id: pathwayId,
      message: 'Pathway created and configured successfully'
    });
  } catch (error) {
    console.error('Error creating pathway:', error);
    console.error('Error details:', error.response?.data);
    res.status(error.response?.status || 500).json({ 
      status: 'error',
      message: error.response?.data?.message || 'Error creating pathway',
      details: error.message
    });
  }
}
