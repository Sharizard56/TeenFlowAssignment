import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 plugins:[react()],
 server:{proxy:{'/api/tasks':'http://localhost:8080','/api/planner':'http://localhost:8000'}}
});
