
// CUTE WEATHER APP - JAVASCRIPT
// API Configuration
const API_KEY = '7fa58de710f0a10cc4662052b5389365';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const welcomeState = document.getElementById('welcome-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const currentWeather = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast-section');

// Weather Data Elements
const cityName = document.getElementById('city-name');
const dateTime = document.getElementById('date-time');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const clouds = document.getElementById('clouds');
const weatherIconAnimated = document.getElementById('weather-icon-animated');
const forecastGrid = document.getElementById('forecast-grid');

// Event Listeners
searchBtn.addEventListener('click', () => searchWeather());
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchWeather();
});
locationBtn.addEventListener('click', () => getLocationWeather());

// Search Weather by City
function searchWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    shakeInput();
    return;
  }
  getWeatherByCity(city);
}

// Get Weather by City Name
async function getWeatherByCity(city) {
  showLoading();
  
  try {
    const currentResponse = await fetch(
      `${API_BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!currentResponse.ok) {
      throw new Error('City not found');
    }
    
    const currentData = await currentResponse.json();
    
    const forecastResponse = await fetch(
      `${API_BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    const forecastData = await forecastResponse.json();
    
    displayWeather(currentData, forecastData);
  } catch (error) {
    showError(error.message || 'City not found. Try another one! 😢');
  }
}

// Get Weather by Geolocation
function getLocationWeather() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser 😢');
    return;
  }
  
  showLoading();
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const currentResponse = await fetch(
          `${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
          `${API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();
        
        displayWeather(currentData, forecastData);
      } catch (error) {
        showError('Could not get weather for your location 😢');
      }
    },
    () => {
      showError('Unable to retrieve your location 😢');
    }
  );
}

// Display Weather Data
function displayWeather(current, forecast) {
  welcomeState.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  
  currentWeather.classList.remove('hidden');
  forecastSection.classList.remove('hidden');
  
  cityName.textContent = `${current.name}, ${current.sys.country}`;
  dateTime.textContent = formatDate(new Date());
  temperature.textContent = Math.round(current.main.temp);
  weatherDescription.textContent = current.weather[0].description;
  feelsLike.textContent = `${Math.round(current.main.feels_like)}°C`;
  humidity.textContent = `${current.main.humidity}%`;
  wind.textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
  clouds.textContent = `${current.clouds.all}%`;
  
  updateWeatherIcon(current.weather[0].main, weatherIconAnimated);
  displayForecast(forecast);
}

// Update Weather Icon with Animation
function updateWeatherIcon(weatherMain, container) {
  container.innerHTML = '';
  container.className = 'weather-icon-animated';
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      container.classList.add('sunny-animated');
      container.innerHTML = '<div class="sun">☀️</div>';
      break;
    case 'clouds':
      container.classList.add('cloudy-animated');
      container.innerHTML = '<div class="cloud">☁️</div>';
      break;
    case 'rain':
    case 'drizzle':
      container.classList.add('rainy-animated');
      container.innerHTML = `
        <div class="cloud">🌧️</div>
        <div class="rain-drop">💧</div>
        <div class="rain-drop">💧</div>
        <div class="rain-drop">💧</div>
      `;
      break;
    case 'thunderstorm':
      container.classList.add('rainy-animated');
      container.innerHTML = `
        <div class="cloud">⛈️</div>
        <div class="rain-drop">💧</div>
        <div class="rain-drop">💧</div>
        <div class="rain-drop">💧</div>
      `;
      break;
    case 'snow':
      container.classList.add('rainy-animated');
      container.innerHTML = `
        <div class="cloud">🌨️</div>
        <div class="rain-drop">❄️</div>
        <div class="rain-drop">❄️</div>
        <div class="rain-drop">❄️</div>
      `;
      break;
    case 'mist':
    case 'fog':
    case 'haze':
      container.classList.add('cloudy-animated');
      container.innerHTML = '<div class="cloud">🌫️</div>';
      break;
    default:
      container.classList.add('partly-cloudy-animated');
      container.innerHTML = '<div class="sun">🌤️</div>';
  }
}

// Get Simple Weather Icon (for forecast)
function getWeatherIcon(weatherMain) {
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return '☀️';
    case 'clouds':
      return '☁️';
    case 'rain':
    case 'drizzle':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '🌨️';
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️';
    default:
      return '🌤️';
  }
}

// Display 5-Day Forecast
function displayForecast(forecastData) {
  const dailyForecasts = forecastData.list.filter(item => 
    item.dt_txt.includes('12:00:00')
  ).slice(0, 5);
  
  forecastGrid.innerHTML = dailyForecasts.map(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const icon = getWeatherIcon(day.weather[0].main);
    const temp = Math.round(day.main.temp);
    const desc = day.weather[0].description;
    
    return `
      <div class="forecast-card">
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="forecast-temp">${temp}°C</div>
        <div class="forecast-desc">${desc}</div>
      </div>
    `;
  }).join('');
}

// State Management Functions
function showLoading() {
  welcomeState.classList.add('hidden');
  errorState.classList.add('hidden');
  currentWeather.classList.add('hidden');
  forecastSection.classList.add('hidden');
  loadingState.classList.remove('hidden');
}

function showError(message) {
  welcomeState.classList.add('hidden');
  loadingState.classList.add('hidden');
  currentWeather.classList.add('hidden');
  forecastSection.classList.add('hidden');
  errorMessage.textContent = message;
  errorState.classList.remove('hidden');
}

// Utility Functions
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

function shakeInput() {
  cityInput.style.animation = 'shake 0.5s';
  setTimeout(() => {
    cityInput.style.animation = '';
  }, 500);
}

// ========================================
// PWA INSTALLATION - BOTÃO FIXO COM DEBUG
// ========================================

let deferredPrompt = null;
const installBtn = document.getElementById('install-btn');

// Captura o evento de instalação
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ beforeinstallprompt disparado - PWA pode ser instalado!');
  e.preventDefault();
  deferredPrompt = e;
  
  // Muda o texto do botão quando estiver pronto
  if (installBtn) {
    installBtn.textContent = '✨ Instalar App (PRONTO) ✨';
    installBtn.style.backgroundColor = '#51cf66'; // Verde quando pronto
  }
});

// Click no botão SEMPRE VISÍVEL
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    console.log('🔘 Botão de instalar clicado');
    
    // Verifica se o prompt está disponível
    if (!deferredPrompt) {
      const errorMsg = `❌ O PWA não pode ser instalado agora.

Possíveis motivos:
• O site não está em HTTPS
• Falta o Service Worker registrado
• Falta o manifest.json válido
• Você já instalou o app
• O navegador ainda não liberou (precisa visitar mais vezes)

Detalhes técnicos:
• Service Worker: ${navigator.serviceWorker ? 'Suportado' : 'NÃO suportado'}
• HTTPS: ${window.location.protocol === 'https:' ? 'Sim' : 'NÃO'}
• Navegador: ${navigator.userAgent}`;
      
      alert(errorMsg);
      console.error(errorMsg);
      return;
    }
    
    try {
      console.log('📲 Mostrando prompt de instalação...');
      
      // Mostra o prompt
      await deferredPrompt.prompt();
      
      // Espera a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Resultado: ${outcome}`);
      
      if (outcome === 'accepted') {
        alert('✅ App instalado com sucesso! Olha na tela inicial do seu celular 💜');
        console.log('✅ Usuário aceitou instalar');
      } else {
        alert('😢 Você recusou a instalação. Mas tudo bem, o botão continua aqui!');
        console.log('❌ Usuário recusou instalar');
      }
      
      // Reseta o prompt
      deferredPrompt = null;
      
      if (installBtn) {
        installBtn.textContent = '✨ Instalar App ✨';
        installBtn.style.backgroundColor = '#b8a4d4';
      }
      
    } catch (error) {
      const errorMsg = `💥 Erro ao tentar instalar: ${error.message}`;
      alert(errorMsg);
      console.error('Erro completo:', error);
    }
  });
}

// Detecta quando o app foi instalado
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA foi instalado com sucesso!');
  alert('🎉 App instalado! Você pode acessá-lo pela tela inicial agora!');
  deferredPrompt = null;
  
  if (installBtn) {
    installBtn.textContent = '✅ App Instalado!';
    installBtn.style.backgroundColor = '#51cf66';
    installBtn.disabled = true;
  }
});

// Log inicial de debug
console.log('🔍 Debug PWA:');
console.log('- Service Worker suportado:', 'serviceWorker' in navigator);
console.log('- HTTPS:', window.location.protocol === 'https:');
console.log('- Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);
