// server/src/index.ts
import express from 'express';
import cors from 'cors';
import sheetsRouter from './routes/sheets';
import aiRouter from './routes/ai';
import formulasRouter from './routes/formulas';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/sheets', sheetsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/formulas', formulasRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
