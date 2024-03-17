export default function handler(req, res) {
    const token = req.nextauth?.token;
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    // Proceed with your API route logic
    res.status(200).json({ message: 'Protected content' });
  }