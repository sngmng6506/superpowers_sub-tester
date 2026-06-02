### 기존 방법
- 작업할 파일 개수와 코드 복잡도를 기준으로 AI가 서브에이전트 모델(Haiku/Sonnet/Opus)을 자체 판단하여 선택·호출함.

### 문제점
- AI의 기준에 따라 복잡도가 높다고 판단되면 상위 등급의 비싼 모델이 지정됨. 특히 에러 수정 및 검수 과정이 포함된 TDD 반복 루프에서 상위 모델이 지속적으로 호출되어 API 비용이 과다하게 발생함.

### 변경 방법
- 초기 기능 구현 단계에서는 고성능 모델을 우선 활용하여 코드 품질을 확보함. 이후 테스트 명령어가 감지되면 프로세스를 일시 중지하고 사용자 승인(y/n) 단계를 거치도록 제어함. 승인 이후 진행되는 에러 수정 및 검수 루프는 사용자가 설정한 저비용 모델(Haiku)로만 실행되도록 규칙을 강제하여 비용을 통제함. **(현재 Claude Code 환경에서만 작동 가능)** 

### 사용 방법 
1. 터미널 창에 /set-testmodel <모델 명 (e.g., sonnet, haiku)> 명령어를 입력하여 테스트 모델을 설정함.
2. AI에게 TDD 기반 기능 구현을 요청하면, 초기 코드는 고성능 모델이 작성함.
3. AI가 테스트를 실행하는 순간 터미널에 사용자 승인 프롬프트(y/n)가 표시되며, y를 입력하면 이후의 에러 수정 및 반복 검수 루프가 설정한 <모델 명> 으로 강제 전환되어 실행됨.
4. y를 입력하면 이후의 에러 수정 및 반복 검수 루프가 설정한 <모델 명>으로 강제 전환되어 실행됨. n을 입력하면 테스트 실행이 생략되며 해당 명령어가 .deferred_tests.txt 파일에 누적 기록됨.
5. 미뤄진 테스트 목록은 /list-deferred 명령어로 확인하고, 누적된 테스트들은 /run-deferred 명령어로 순차적 일괄 수행이 가능함.

### 로컬 경로 직접 설치 방법


**저장소 클론 (다운로드)**
터미널을 열고 플러그인을 보관할 폴더로 이동한 뒤, 아래 명령어를 입력하여 코드를 다운로드

git clone [https://github.com/sngmng6506/superpowers_sub-tester.git](https://github.com/sngmng6506/superpowers_sub-tester.git)

**Mac/Linux OS**

*예시 경로*
/plugin install /Users/사용자이름/경로/superpowers_sub-tester

**Windows OS**

*예시 경로*
/plugin install C:\경로\superpowers_sub-tester


### 명령어 정리

/set-testmodel <모델 명> : TDD 반복 루프를 전담할 백그라운드 테스트 모델 지정 (haiku, sonnet, opus 등)

/list-deferred : 현재 실행하지 않고 미뤄둔 (.deferred_tests.txt에 저장된) 테스트 명령어 목록 조회

/run-deferred : 목록에 쌓여있는 모든 미뤄진 테스트를 위에서부터 순서대로 한 번에 일괄 실행하고 목록 비우기
