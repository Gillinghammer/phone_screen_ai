import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import * as cheerio from 'cheerio'

async function scrapeJobPage(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000 // 5 second timeout
    })
    const $ = cheerio.load(response.data)
    
    // Remove script and style elements
    $('script').remove()
    $('style').remove()
    
    // Get all text content
    return $('body').text().trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
  } catch (error) {
    console.error('Error scraping page:', error)
    throw error
  }
}

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

    try {
      const jobDescription = await scrapeJobPage(url)
      if (!jobDescription) {
        throw new Error('No content found')
      }
      res.status(200).json({ jobDescription })
    } catch (error) {
      console.error('Failed to scrape job listing:', error)
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          res.status(408).json({ message: 'Request timeout' })
        } else if (error.response?.status === 403) {
          res.status(403).json({ message: 'Access denied by the job board. Please copy and paste the job description directly.' })
        } else {
          res.status(500).json({ message: 'Failed to access the job listing. Please copy and paste the job description directly.' })
        }
      } else {
        res.status(500).json({ message: 'Failed to scrape job listing. Please copy and paste the job description directly.' })
      }
    }
  } catch (error) {
    console.error('Error in job scraping handler:', error)
    res.status(500).json({ message: 'Failed to scrape job listing' })
  }
}
