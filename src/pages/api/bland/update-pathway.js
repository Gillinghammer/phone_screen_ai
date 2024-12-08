import axios from 'axios';
import { prisma } from '../../../lib/prisma';
import { NODE_CONFIGS, createEdges } from '../../../lib/config/bland';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { pathwayId, jobId, jobTitle, interviewQuestions } = req.body;

  if (!pathwayId || !jobId || !interviewQuestions || !Array.isArray(interviewQuestions)) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    // Fetch the existing pathway
    const getResponse = await axios.get(`https://api.bland.ai/v1/pathway/${pathwayId}`, {
      headers: {
        'authorization': process.env.BLAND_API_KEY
      }
    });

    const existingPathway = getResponse.data;

    if (!existingPathway || !Array.isArray(existingPathway.nodes)) {
      console.error('Invalid pathway data:', existingPathway);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pathway data received from Bland API'
      });
    }

    // Create nodes using config
    const startNode = NODE_CONFIGS.start;
    const readyNode = NODE_CONFIGS.ready(jobTitle);
    const questionNodes = interviewQuestions.map((question, index) => NODE_CONFIGS.question(question, index));
    const endNode = NODE_CONFIGS.end;

    // Combine all nodes
    const updatedNodes = [startNode, readyNode, ...questionNodes, endNode];

    // Create edges using config
    const edges = createEdges({ startNode, readyNode, questionNodes, endNode });

    // Prepare the updated pathway
    const updatedPathway = {
      ...existingPathway,
      name: jobTitle,
      description: `Phone screen pathway for ${jobTitle} position`,
      nodes: updatedNodes,
      edges: edges
    };

    // Update the pathway
    const updateResponse = await axios.post(`https://api.bland.ai/v1/pathway/${pathwayId}`, 
      updatedPathway,
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.BLAND_API_KEY
        }
      }
    );

    // Update the job in the database with the pathwayId
    await prisma.job.update({
      where: { id: jobId },
      data: { blandPathwayId: pathwayId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Pathway updated successfully',
      pathway_data: updateResponse.data
    });
  } catch (error) {
    console.error('Error updating pathway:', error);
    console.error('Error details:', error.response?.data);
    res.status(error.response?.status || 500).json({ 
      status: 'error',
      message: error.response?.data?.message || 'Error updating pathway',
      details: error.message
    });
  }
}
