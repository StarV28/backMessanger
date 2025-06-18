import { Router } from 'express';

const router = Router();
router.get('/', (req, res) => {
  try {
    console.log('--------------------------------Index');
    console.log(`Request: ${req.method} ${req.url}`);
    console.log(req.body);

    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    res.status(404).send('<p>Error main page</p>');
  }
});

export default router;
