/* eslint-disable no-use-before-define */
import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import SoundEffects from '@js/SoundEffects';

// Initialize slot machine
(() => {
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const winnerWrapper = document.getElementById('winner') as HTMLDivElement | null;
  const winnerContent = document.getElementById('winner-panel') as HTMLDivElement | null;
  const winnerCloseButton = document.getElementById('winner-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;
  const prizeNumber = document.getElementById('prize-number') as HTMLButtonElement | null;
  const prizeName = document.getElementById('prize-name') as HTMLButtonElement | null;
  const roundContainer = document.getElementById('round-container') as HTMLButtonElement | null;

  // Graceful exit if necessary elements are not found
  if (!(
    settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && winnerWrapper
    && winnerContent
    && winnerCloseButton
    && sunburstSvg
    && confettiCanvas
    && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
    && prizeNumber
    && prizeName
    && roundContainer
  )) {
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error('Confetti canvas is not an instance of Canvas. This is possibly a bug.');
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 40;
  const CONFETTI_COLORS = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]],
      scalar: confettiScale
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  /** Function to stop the winning animation */
  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
    sunburstSvg.style.display = 'none';
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
    prizeNumber.textContent = `Lucky Draw #${slot.currentPrizeNumber}`;
    prizeName.textContent = '';
    const imgElement = roundContainer.querySelector('img');
    if (imgElement) {
      imgElement.remove();
    }
    const lucky = document.getElementById('prize-number') as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'block';
    }
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    const lucky = document.getElementById('prize-number') as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'none';
    }
    onShowPrizeName();
  };

  /** To open the winner page */
  const onShowWinnerPopup = () => {
    populateWinnerList(slot.winner);
    winnerWrapper.style.display = 'block';
  };

  /** To open the grand winner page */
  const onShowPrizeName = () => {
    // extract data to get the latest winner
    const latestRound = slot.winner[slot.winner.length - 1];

    // Get the winners array from the latest round
    const latestWinners = latestRound.winners;

    // Get the last winner from the latest winners
    const latestWinner = latestWinners[latestWinners.length - 1];

    // show prize name
    prizeName.textContent = `${latestWinner.prize}`;
    if (latestWinner.number < 11) {
      // Create a new img element for the image
      const roundImage = document.createElement('img');
      roundImage.setAttribute('src', latestWinner.img); // Set the image source
      roundImage.setAttribute('alt', `Prize number ${slot.currentPrizeNumber + 1}`); // Set the alt text
      // roundImage.style.width = '100%'; // Set the width
      roundImage.style.maxHeight = '340px'; // Set the height
      roundContainer.style.zIndex = '1'; // Set z-index
      roundContainer.appendChild(roundImage);
    }
  };

  /** To close the winner page */
  const onWinnerClose = () => {
    settingsContent.scrollTop = 0;
    winnerWrapper.style.display = 'none';
  };

  /** To show ready state */
  const onShowReady = () => {
    onSpinStart();
    const lucky = document.getElementById('lucky-draw') as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'inline';
    }
  };

  /** Slot instance */
  const slot = new Slot({
    reelContainerSelector: '#reel',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation,
    onShowWinnerPopup
  });

  /** To open the setting page */
  const onSettingsOpen = () => {
    nameListTextArea.value = slot.names.length ? slot.names.join('\n') : '';
    removeNameFromListCheckbox.checked = slot.shouldRemoveWinnerFromNameList;
    enableSoundCheckbox.checked = !soundEffects.mute;
    settingsWrapper.style.display = 'block';
  };

  /** To close the setting page */
  const onSettingsClose = () => {
    settingsContent.scrollTop = 0;
    settingsWrapper.style.display = 'none';
  };

  // Click handler for "Save" button for setting page
  settingsSaveButton.addEventListener('click', () => {
    slot.names = nameListTextArea.value
      ? nameListTextArea.value.split(/\n/).filter((name) => Boolean(name.trim()))
      : [];
    slot.shouldRemoveWinnerFromNameList = removeNameFromListCheckbox.checked;
    soundEffects.mute = !enableSoundCheckbox.checked;
    onSettingsClose();
  });

  // Click handler for "Discard and close" button for setting page
  settingsCloseButton.addEventListener('click', onSettingsClose);

  const populateWinnerList = (winnerData) => {
    const setData = winnerData[winnerData.length - 1];

    winnerContent.innerHTML = ''; // Clear previous content
    // Iterate through rounds in the winner data
    // Create a new label element for the round
    const setLabel = document.createElement('label');
    setLabel.setAttribute('for', `name-list-${setData.number}`);
    setLabel.textContent = setData.setTitle;

    // Create a new table element
    const table = document.createElement('table');

    // Use forEach for winners array
    setData.winners.forEach((winner, winnerIndex) => {
      const row = table.insertRow();

      // Add winner.number to the first column
      const cell1 = row.insertCell(0);
      cell1.textContent = `${winner.number}`;

      // Add winner.name to the second column
      const cell2 = row.insertCell(1);
      cell2.textContent = winner.name;

      // Add winner.prize to the third column
      const cell3 = row.insertCell(2);
      cell3.textContent = winner.prize;

      // Add a class for the animation
      row.classList.add('winner-animation');

      // Calculate the animation delay
      const animationDelay = 0 * 1000 + winnerIndex * 500;

      // Set a timeout to display the animation with the calculated delay
      setTimeout(() => {
        row.classList.add('animate');
      }, animationDelay);
    });

    // Append the label and table to the winnerContent
    winnerContent.appendChild(setLabel);
    winnerContent.appendChild(table);
  };

  // Only show at last ten prize
  const lucky = document.getElementById('lucky-draw') as HTMLDivElement | null;
  if (lucky) {
    lucky.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', () => {
    // This function will be called when the DOM is ready

    let isInputDisabled = false;
    let isReady = false;

    const disableInputForSeconds = (milliseconds) => {
      isInputDisabled = true;
      setTimeout(() => {
        isInputDisabled = false;
      }, milliseconds);
    };

    document.addEventListener('keydown', (event) => {
      console.log('Key pressed:', event.key);
      if (event.key === ' ') {
        // Check if input is disabled
        if (isInputDisabled) {
          return; // Ignore key press if input is disabled
        }
        if (!slot.names.length) {
          onSettingsOpen();
          return;
        }
        if (slot.currentPrizeNumber === 10 && isReady === false) {
          onWinnerClose();
          onShowReady();
          isReady = true;
          return;
        }
        slot.spin();

        // Disable input for 3 seconds (3000 milliseconds)
        disableInputForSeconds(7000);
      }
      if (event.key === 's') {
        onSettingsOpen();
      }
      if (event.key === 'w') {
        onShowWinnerPopup();
      }
      if (event.key === 'c') {
        onWinnerClose();
        if (lucky) {
          lucky.style.display = 'block';
        }
      }
      if (event.key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          return;
        }
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  });

  slot.names = [
    'Annabella Ak Peter Dien/Ardini Anna Abdullah',
    'Mohamed Syazwan Abdullah @ Laga',
    'Awangku Mohd Hazriq Fadzly bin Awg Ahmad',
    'Mohammad Khairul bin Abu Bakar ',
    'Maximilian Kolbe Saribu anak Raymond',
    'Mc Cartney Issac Garston anak Christoper',
    'Jacqueline Janta anak Boniface Intang',
    'Ayunni Maisarah Binti Rosminuddin',
    'Danel Hakim bin Mohammad West',
    'Mohammad Khairusrizuan bin Khasim',
    'Awang Mantaha bin Awang Mostapha',
    'Mohammad Asmawie Bin Mohamed Osman',
    'Mohammad Syaiful Yazan Bin Nakhoda',
    'Reidson Ridzan Anak Leonard Lonod',
    'Genevieve Melia AK George Gladwyns Tait',
    'Muhammad Iman Hafiz Bin Muhammad Sazali',
    'Abang Yusrin Hakim bin Abang Drahman',
    'Abang Amirudin bin Abang Abdul Gapor',
    'Helton Sayang anak Boniface Entalang',
    'Awang Zekryanto bin Awang Bujang',
    'Dygku Nuraysyah Lee Bt. Awang Jidel'
  ];
})();
