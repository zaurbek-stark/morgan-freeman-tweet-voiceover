import './App.css';
import { useState, useRef } from 'react';
import { useInterval } from './useInterval';
import { Spinner } from 'react-bootstrap'

function App() {
  const [audioUrl, setAudioUrl] = useState();
  const [inferenceJobToken, setInferenceJobToken] = useState();
  const textareaRef = useRef(null);

  const callAPI = async (inputText) => {
    setAudioUrl();
    try {
      const res = await fetch('https://api.fakeyou.com/tts/inference', {
        method: 'POST',
        body: JSON.stringify({
          uuid_idempotency_token: Math.random().toString(36).slice(2),
          tts_model_token: "TM:cpwrmn5kwh97",
          inference_text: inputText
        }),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      })
      const json = await res.json();
      setInferenceJobToken(json.inference_job_token);
    } catch(e) {
      console.log(e);
    }
  };

  useInterval(async () => {
    if (!inferenceJobToken) return;
    const res = await fetch(`https://api.fakeyou.com/tts/job/${inferenceJobToken}`);
    const json = await res.json();
    const status = json?.state?.status;
    switch (status) {
      case "pending":
      case "started":
      case "attempt_failed":
        return;
      case "complete_success":
        setAudioUrl(json.state.maybe_public_bucket_wav_audio_path);
        return;
      default: 
        return;
    }
  }, 1000);

  const playVoice = () => {
    const voice = new Audio(`https://storage.googleapis.com/vocodes-public${audioUrl}`);
    console.log(`https://storage.googleapis.com/vocodes-public${audioUrl}`);
    voice.play();
  }

  return (
    <div className="App">
      <h3 class="title">Morgan Freeman narrates your life</h3>
      <div class="tweet-wrapper">
        <div class="input-box">
          <textarea ref={textareaRef} className="tweet-area" placeholder="What's happening?"/>

        </div>
        <div class="bottom">
          <ul class="icons">
            <li><i class="far fa-file-image"></i></li>
            <li><i class="fas fa-map-marker-alt"></i></li>
            <li><i class="far fa-grin"></i></li>
            <li><i class="far fa-user"></i></li>
          </ul>
          <div class="content">
            <span class="counter">100</span>
            <button onClick={() => callAPI(textareaRef.current.value)}>Send</button>
            <button className="voice-button" disabled={!audioUrl} onClick={playVoice}>{
              audioUrl || !inferenceJobToken ? "Start" : (
                <Spinner as="span"
                    variant="light"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    animation="border"/>
              )
            }</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
