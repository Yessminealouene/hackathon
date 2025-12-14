const moodColors = {
  1: "#ff4d4d",
  2: "#ffa64d",
  3: "#ffd24d",
  4: "#9be15d",
  5: "#4CAF50"
};

let moods = JSON.parse(localStorage.getItem("moods")) || [];

const ctx = document.getElementById("moodChart");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: moods.map(m => m.date),
    datasets: [{
      label: "Mood Over Time",
      data: moods.map(m => m.value),
      borderColor: "#4CAF50",
      tension: 0.3
    }]
  }
});

function addMood() {
  const value = document.getElementById("moodSelect").value;
  const date = new Date().toLocaleString();

  const mood = { value: Number(value), date };
  moods.push(mood);

  localStorage.setItem("moods", JSON.stringify(moods));

  chart.data.labels.push(date);
  chart.data.datasets[0].data.push(Number(value));
  chart.update();

  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("moodHistory");
  container.innerHTML = "";

  moods.forEach(m => {
    const div = document.createElement("div");
    div.style.background = moodColors[m.value];
    div.innerText = `${m.date} — Mood: ${m.value}`;
    container.appendChild(div);
  });
}

renderHistory();