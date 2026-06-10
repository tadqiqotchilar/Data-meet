import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHearts from './components/FloatingHearts';
import Fireworks from './components/Fireworks';

function App() {
  const [step, setStep] = useState(1);
  const noBtnRef = useRef(null);
  
  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [food, setFood] = useState('');

  // No button fleeing offset position
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });

  // Fireworks display state
  const [showFireworks, setShowFireworks] = useState(false);

  // Heart bursts state (Step 1 clicks)
  const [heartBursts, setHeartBursts] = useState([]);

  // Proximity mouse movement tracker for Step 1
  useEffect(() => {
    if (step !== 1) return;

    const handleMouseMove = (e) => {
      if (!noBtnRef.current) return;
      const rect = noBtnRef.current.getBoundingClientRect();
      const buffer = 15; // 15px proximity detection
      
      const isClose = (
        e.clientX >= rect.left - buffer &&
        e.clientX <= rect.right + buffer &&
        e.clientY >= rect.top - buffer &&
        e.clientY <= rect.bottom + buffer
      );

      if (isClose) {
        handleFlee();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [step, noBtnPos]);

  const handleFlee = () => {
    const minDistance = 80;
    let newX = 0;
    let newY = 0;
    
    // Calculate new position ensuring it moves at least 80px away from current position
    do {
      newX = (Math.random() * 2 - 1) * 180; // range [-180, 180]
      newY = (Math.random() * 2 - 1) * 120; // range [-120, 120]
    } while (
      Math.abs(newX - noBtnPos.x) < minDistance && 
      Math.abs(newY - noBtnPos.y) < minDistance
    );

    setNoBtnPos({ x: newX, y: newY });
  };

  const handleAwaClick = (e) => {
    // Generate heart burst animation
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const newHearts = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() * 60 - 30),
      y: y + (Math.random() * 60 - 30),
      scale: Math.random() * 0.8 + 0.5,
      delay: Math.random() * 0.2
    }));

    setHeartBursts(newHearts);
    
    // Show fireworks in background
    setShowFireworks(true);
    setTimeout(() => {
      setShowFireworks(false);
    }, 2500); // exactly 2.5 seconds of fireworks as requested!

    // Transition to step 2 after a small delay to see the burst
    setTimeout(() => {
      setStep(2);
    }, 450);
  };

  const sendTelegramNotification = (selectedDate, selectedTime, selectedFood) => {
    const botToken = "8894382436:AAGw9wkheRGA-sG0RZsBI03YwKYReLfdDSU";
    const chatId = "315229461";

    const foodEmojiLabel = foodOptions.find(o => o.id === selectedFood);
    const foodLabel = foodEmojiLabel ? `${foodEmojiLabel.emoji} ${foodEmojiLabel.label}` : selectedFood;

    const formattedDate = getFormattedDate(selectedDate);

    const message = `💖 *Yangi uchrashuv belgilandi!* 💖\n\n` +
                    `📅 *Sana:* ${formattedDate}\n` +
                    `⏰ *Vaqt:* ${selectedTime}\n` +
                    `🍽️ *Tanlov:* ${foodLabel}`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Telegram notification sent successfully:", data);
    })
    .catch(err => {
      console.error("Error sending Telegram notification:", err);
    });
  };

  const handleConfirmDate = () => {
    sendTelegramNotification(date, time, food);
    setStep(5);
  };

  // Activity grid options
  const foodOptions = [
    { id: 'pizza', label: 'Pizza', emoji: '🍕' },
    { id: 'lavash', label: 'Lavash', emoji: '🌯' },
    { id: 'burger', label: 'Burger', emoji: '🍔' },
    { id: 'shirinlik', label: 'Shirinlik', emoji: '🍰' },
    { id: 'aylanuw', label: 'aylanuw', emoji: '🌳' },
    { id: 'basqa', label: 'Basqa variant', emoji: '🗺️' }
  ];

  // Helper to format date nicely
  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="app-container">
      {/* Floating hearts animation everywhere */}
      <FloatingHearts />

      {/* Fireworks salute for 2 seconds when Awa is clicked */}
      {showFireworks && <Fireworks />}

      {/* Render flying hearts bursts */}
      {heartBursts.map((h) => (
        <motion.div
          key={h.id}
          className="heart-burst"
          initial={{ x: h.x, y: h.y, opacity: 1, scale: 0.2 }}
          animate={{ 
            y: h.y - 120, 
            x: h.x + (Math.random() * 100 - 50), 
            opacity: 0, 
            scale: h.scale * 1.5 
          }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: h.delay }}
          onAnimationComplete={() => {
            setHeartBursts((prev) => prev.filter((item) => item.id !== h.id));
          }}
          style={{ color: '#ff477e' }}
        >
          ❤️
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            className="proposal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="cat-container">
              <img src="/cat_proposal.png" className="cat-image" alt="Cute proposal cat" />
            </div>
            
            <h1 className="card-title">
              🌸 Meniń menen ushırasıwǵa barasız ba? 🌸
            </h1>

            <div className="button-group">
              <button 
                className="btn-primary" 
                onClick={handleAwaClick}
              >
                Awa 😍
              </button>

              <motion.button
                ref={noBtnRef}
                className="btn-secondary"
                animate={{ 
                  x: noBtnPos.x, 
                  y: noBtnPos.y 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                onMouseEnter={handleFlee}
                onClick={handleFlee}
              >
                Yaq 😔
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            className="proposal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="cat-container">
              <img src="/cat_happy.png" className="cat-image" alt="Happy emotional cat" />
            </div>

            <h1 className="card-title">
              Siz rastanam awa dediniz be? 😭
            </h1>

            <button 
              className="btn-primary" 
              onClick={() => setStep(3)}
            >
              Zor keyingi →
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            className="proposal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="cat-container">
              <img src="/cat_thinking.png" className="cat-image" alt="Thinking serious cat" />
            </div>

            <h1 className="card-title">
              Al yendi... qashan bos bolasız?
            </h1>

            <div className="form-group">
              <label className="form-label">Sana tanlang</label>
              <input 
                type="date" 
                className="custom-input" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qays vaqt?</label>
              <div className="select-wrapper">
                <select 
                  className="custom-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="10:00">10:00</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="16:00">16:00</option>
                  <option value="18:00">18:00</option>
                  <option value="20:00">20:00</option>
                  <option value="22:00">22:00</option>
                </select>
              </div>
            </div>

            <button 
              className="btn-primary" 
              disabled={!date}
              onClick={() => setStep(4)}
              style={{ width: '100%', marginTop: '8px', opacity: date ? 1 : 0.6 }}
            >
              Sáneni belgileń →
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            className="proposal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            style={{ maxWidth: '580px' }}
          >
            <h1 className="card-title" style={{ marginBottom: '24px' }}>
              Ushırasıwda ne jeymiz?
            </h1>

            <div className="food-grid">
              {foodOptions.map((opt) => (
                <div 
                  key={opt.id}
                  className={`food-item ${food === opt.id ? 'selected' : ''}`}
                  onClick={() => setFood(opt.id)}
                >
                  <div className="food-icon">{opt.emoji}</div>
                  <div className="food-label">{opt.label}</div>
                </div>
              ))}
            </div>

            <button 
              className="btn-primary" 
              disabled={!food}
              onClick={handleConfirmDate}
              style={{ width: '100%', opacity: food ? 1 : 0.6 }}
            >
              Ushırasıwdı tastıyıqlaw 💖
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="step5"
            className="proposal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="cat-container" style={{ width: '120px', height: '120px' }}>
              <img src="/cat_happy.png" className="cat-image" alt="Happy cat" />
            </div>

            <h1 className="card-title" style={{ marginBottom: '20px' }}>
              Uraaa! Kelishdik! 🎉❤️
            </h1>

            <div className="summary-details">
              <div className="summary-row">
                <span className="summary-icon">📅</span>
                <div className="summary-content">
                  <span className="summary-label">Uchrashuv sanasi:</span>
                  <span className="summary-val">{getFormattedDate(date)}</span>
                </div>
              </div>

              <div className="summary-row">
                <span className="summary-icon">⏰</span>
                <div className="summary-content">
                  <span className="summary-label">Uchrashuv vaqti:</span>
                  <span className="summary-val">{time}</span>
                </div>
              </div>

              <div className="summary-row">
                <span className="summary-icon">🍽️</span>
                <div className="summary-content">
                  <span className="summary-label">Tanlov:</span>
                  <span className="summary-val">
                    {foodOptions.find(o => o.id === food)?.emoji} {foodOptions.find(o => o.id === food)?.label}
                  </span>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ff477e', marginBottom: '24px' }}>
              Siz bilan ko'rishishni sabrsizlik bilan kutaman! 😘
            </h2>

            <button 
              className="btn-primary"
              onClick={() => {
                // Reset back to step 1
                setStep(1);
                setDate('');
                setFood('');
                setNoBtnPos({ x: 0, y: 0 });
              }}
              style={{ background: 'linear-gradient(135deg, #ab47bc 0%, #ff5c8a 100%)' }}
            >
              Qaytadan boshlash 🔄
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
