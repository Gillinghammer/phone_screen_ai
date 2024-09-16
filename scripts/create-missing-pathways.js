import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function createPathway(job, index, total) {
  console.log(`\nProcessing job ${index + 1} of ${total}`);
  console.log(`Job ID: ${job.id}, Title: ${job.jobTitle}`);
  
  try {
    console.log('Sending request to create pathway...');
    const response = await axios.post('http://localhost:3000/api/bland/create-pathway', {
      name: job.jobTitle,
      description: `Phone screen pathway for ${job.jobTitle} position`,
      questions: job.interviewQuestions.set,
      jobTitle: job.jobTitle,
      jobId: job.id
    });

    if (response.data.status === 'success') {
      console.log(`Pathway created successfully. Pathway ID: ${response.data.pathway_id}`);
      console.log('Updating job record with new pathway ID...');
      await prisma.job.update({
        where: { id: job.id },
        data: { blandPathwayId: response.data.pathway_id }
      });
      console.log(`Job ${job.id} updated successfully with new pathway ID.`);
    } else {
      console.error(`Failed to create pathway for job ${job.id}: ${response.data.message}`);
    }
  } catch (error) {
    console.error(`Error creating pathway for job ${job.id}:`, error.message);
  }
}

async function main() {
  try {
    console.log('Fetching jobs without pathways...');
    const jobsWithoutPathway = await prisma.job.findMany({
      where: { blandPathwayId: null },
      select: {
        id: true,
        jobTitle: true,
        interviewQuestions: true
      }
    });

    console.log(`Found ${jobsWithoutPathway.length} jobs without pathways.`);

    if (jobsWithoutPathway.length > 0) {
      console.log('\n--- Processing all jobs ---');
      for (let i = 0; i < jobsWithoutPathway.length; i++) {
        await createPathway(jobsWithoutPathway[i], i, jobsWithoutPathway.length);
      }
    }

    console.log('\nFinished creating pathways.');
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();