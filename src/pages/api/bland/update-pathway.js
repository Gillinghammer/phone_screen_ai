import axios from 'axios';
import { prisma } from '../../../lib/prisma';

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
    const getResponse = await axios.get(`https://api.bland.ai/v1/convo_pathway/${pathwayId}`, {
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

    // Find the start and end nodes
    const startNode = existingPathway.nodes.find(node => node.data.isStart);
    const endNode = existingPathway.nodes.find(node => node.type === 'End Call');

    if (!startNode || !endNode) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pathway structure: missing start or end node'
      });
    }

    // Create new question nodes
    const questionNodes = interviewQuestions.map((question, index) => ({
      id: `question_${index + 1}`,
      data: {
        name: `Question ${index + 1}`,
        type: "Default",
        text: question,
        isStart: false,
        isGlobal: false,
        condition: "The candidate has finished answering the question, even if they didn't provide the answer you were looking for.",
        extractVars: [["answer", "string", "The candidate's answer to the question"]],
        modelOptions: {
          modelType: "smart",
          temperature: 0,
          skipUserResponse: false,
          block_interruptions: false,
          interruptionThreshold: 200
        }
      },
      type: "Default"
    }));

    // Update the ready node
    const readyNode = {
      id: "ready_to_begin",
      data: {
        name: "Ready to begin",
        text: `Ok great, and to confirm you are ready to begin the phone screen for the ${jobTitle} position?`,
        active: false,
        condition: "The condition is achieved if the user confirms yes, or they are ready to begin",
        globalPrompt: "You're a professional candidate recruiter named Ashley performing a phone screen for this candidate you've just called. After the candidate has been asked a question you will wait for an appropriate amount of time to move on to the next question. Never ask the candidate to elaborate, simply accept their answer and continue.",
        modelOptions: {
          modelType: "Bland Beta",
          temperature: 0
        }
      },
      type: "Default"
    };

    // Combine all nodes
    const updatedNodes = [startNode, readyNode, ...questionNodes, endNode];

    // Create edges
    const edges = [
      { id: "edge-start-ready", label: "User responds", source: startNode.id, target: readyNode.id },
      { id: "edge-ready-first-question", label: "User confirms ready to begin", source: readyNode.id, target: questionNodes[0].id },
      ...questionNodes.slice(0, -1).map((node, index) => ({
        id: `edge-question-${index + 1}`,
        label: "Candidate answered the interview question",
        source: node.id,
        target: questionNodes[index + 1].id
      })),
      { id: "edge-lastquestion-end", label: "Candidate answered the interview question", source: questionNodes[questionNodes.length - 1].id, target: endNode.id }
    ];

    // Prepare the updated pathway
    const updatedPathway = {
      ...existingPathway,
      name: jobTitle,
      description: `Phone screen pathway for ${jobTitle} position`,
      nodes: updatedNodes,
      edges: edges
    };

    // Update the pathway
    const updateResponse = await axios.post(`https://api.bland.ai/v1/convo_pathway/${pathwayId}`, 
      updatedPathway,
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
