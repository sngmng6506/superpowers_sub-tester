const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputData = '';
rl.on('line', (line) => { inputData += line; });

rl.on('close', () => {
  try {
    const event = JSON.parse(inputData);
    const prompt = event.prompt.trim();

    // 사용자가 입력한 문자열이 /set-model로 시작하는지 '기능적'으로 검사
    if (prompt.startsWith('/set-model ')) {
      const modelName = prompt.replace('/set-model ', '').trim();
      
      let fullModelName = 'claude-3-haiku-20240307'; // 기본값
      if (modelName === 'sonnet') fullModelName = 'claude-3-5-sonnet-latest';
      if (modelName === 'opus') fullModelName = 'claude-3-opus-20240229';

      // 1. AI 컨텍스트가 아닌, 로컬 상태 파일에 모델명 물리적 저장 (기능적 변경)
      fs.writeFileSync('.superpowers_state.json', JSON.stringify({ current_subagent_model: fullModelName }));

      // 2. 터미널에 성공 메시지 출력 (출력 스트림 제어)
      console.error(`\n⚙️ [Superpowers] 하청 모델이 [${fullModelName}]으로 기능적 고정되었습니다.\n`);

      // 3. ★핵심★ Exit Code 2를 반환하여 AI(LLM) 호출을 완전히 취소하고 턴을 종료함
      process.exit(2);
    }
  } catch (e) {
    process.exit(0);
  }
  // /set-model 명령어가 아니면 아무 일 없었다는 듯 정상 진행 (AI에게 문장 전달)
  process.exit(0);
});
