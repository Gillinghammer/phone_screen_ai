import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, description, questions = [], jobTitle = "open", jobId } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Missing required field: name' });
  }

  const startNode = {
    id: "1",
    data: {
      name: "Phone Screen AI introduces themself to the candidate",
      text: "Hi, this is Ashley your AI recruiter. Is now a good time to chat?",
      active: false,
      isStart: true,
      globalPrompt: "You're a professional candidate recruiter named Ashley performing a phone screen for this candidate you've just called. Ask each question and wait for the candidate to respond before moving to the next question.",
      modelOptions: {
        modelType: "Bland Beta",
        temperature: 0
      }
    },
    type: "Default"
  };

  const readyToBeginNode = {
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

  const endNode = {
    id: "end",
    data: {
      name: "End Call",
      active: true,
      prompt: "Thank the candidate for their participation and that their answers will be reviewed and a human member of the team will be in touch.",
      globalPrompt: "You're a professional candidate recruiter named Ashley performing a phone screen for this candidate you've just called. Ask each question and wait for the candidate to respond before moving to the next question.",
      modelOptions: {
        modelType: "smart",
        temperature: 0,
        skipUserResponse: false,
        block_interruptions: false
      }
    },
    type: "End Call"
  };

  // Create nodes for each question
  const questionNodes = questions.map((question, index) => ({
    id: `question_${index + 1}`,
    data: {
      name: `Question ${index + 1}`,
      isStart: false,
      isGlobal: false,
      type: "Default",
      text: question,
      condition: "The candidate has finished answering the question, even if they didn't provide the answer you were looking for.",
      modelOptions: {
        modelName: "smart",
        temperature: 0,
        skipUserResponse: false,
        block_interruptions: false,
        interruptionThreshold: 200
      },
      extractVars: [["answer", "string", "The candidate's answer to the question"]]
    },
    type: "Default"
  }));

  // Combine all nodes
  const allNodes = [startNode, readyToBeginNode, ...questionNodes, endNode];

  // Create edges
  const edges = [
    {
      id: "edge-start-ready",
      source: "1",
      target: "ready_to_begin",
      label: "User responds"
    },
    {
      id: "edge-ready-first-question",
      source: "ready_to_begin",
      target: "question_1",
      label: "User confirms ready to begin"
    },
    ...questionNodes.map((node, index) => ({
      id: `edge-question-${index + 1}`,
      source: node.id,
      target: index === questionNodes.length - 1 ? "end" : `question_${index + 2}`,
      label: "Candidate answered the interview question"
    }))
  ];

  try {
    // Step 1: Create the basic pathway
    const createResponse = await axios.post('https://api.bland.ai/v1/convo_pathway/create', 
      { name:jobId, description },
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.BLAND_API_KEY
        }
      }
    );

    const pathwayId = createResponse.data.pathway_id;

    // Add a 5-second delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Update the pathway with nodes and edges
    const updateResponse = await axios.post(`https://api.bland.ai/v1/convo_pathway/${pathwayId}`, 
      { name: jobId, description, nodes: allNodes, edges },
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.BLAND_API_KEY
        }
      }
    );

    res.status(200).json({
      status: 'success',
      pathway_id: pathwayId,
      message: 'Pathway created and updated successfully',
      pathway_data: updateResponse.data.pathway_data
    });
  } catch (error) {
    console.error('Error creating/updating pathway:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      status: 'error',
      message: error.response?.data?.message || 'Error creating/updating pathway'
    });
  }
}
