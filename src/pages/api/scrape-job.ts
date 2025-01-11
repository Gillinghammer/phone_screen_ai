import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ message: 'URL is required' })
    }

    // Simulate a delay for scraping
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock job description
    const jobDescription = `Job Title: Senior Marketing Manager

Company: Tesla

Location: Palo Alto, CA

Job Description:
We are seeking a highly motivated and experienced Senior Marketing Manager to join our team at Tesla. The ideal candidate will have a strong background in digital marketing, brand management, and team leadership.

Responsibilities:
- Develop and implement comprehensive marketing strategies
- Lead a team of marketing professionals
- Analyze market trends and competitor activities
- Manage budget and resource allocation for marketing initiatives
- Collaborate with cross-functional teams to align marketing efforts with overall business goals

Requirements:
- Bachelor's degree in Marketing, Business, or related field
- 7+ years of experience in marketing, with at least 3 years in a senior role
- Proven track record of successful marketing campaigns
- Strong analytical and problem-solving skills
- Excellent communication and leadership abilities
- Experience with digital marketing tools and platforms
- Knowledge of the automotive industry is a plus

If you are passionate about sustainable energy and want to be part of a revolutionary company, we encourage you to apply for this exciting opportunity at Tesla.`

    res.status(200).json({ jobDescription })
  } catch (error) {
    console.error('Error scraping job:', error)
    res.status(500).json({ message: 'Failed to scrape job listing' })
  }
}
