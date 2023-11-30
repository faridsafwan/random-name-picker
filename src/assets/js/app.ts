/* eslint-disable no-use-before-define */
import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import SoundEffects from '@js/SoundEffects';

// Initialize slot machine
(() => {
  const drawButton = document.getElementById('draw-button') as HTMLButtonElement | null;
  const fullscreenButton = document.getElementById('fullscreen-button') as HTMLButtonElement | null;
  const settingsButton = document.getElementById('settings-button') as HTMLButtonElement | null;
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const winnerButton = document.getElementById('winner-button') as HTMLButtonElement | null;
  const winnerWrapper = document.getElementById('winner') as HTMLDivElement | null;
  const winnerContent = document.getElementById('winner-panel') as HTMLDivElement | null;
  const winnerCloseButton = document.getElementById('winner-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;
  const prizeNumber = document.getElementById('prize-number') as HTMLButtonElement | null;
  const roundContainer = document.getElementById('round-container') as HTMLButtonElement | null;

  // Graceful exit if necessary elements are not found
  if (!(
    drawButton
    && fullscreenButton
    && settingsButton
    && settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && winnerButton
    && winnerWrapper
    && winnerContent
    && winnerCloseButton
    && sunburstSvg
    && confettiCanvas
    && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
    && prizeNumber
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
    drawButton.disabled = true;
    settingsButton.disabled = true;
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
    prizeNumber.textContent = `Lucky Draw #${slot.currentPrizeNumber}`;
    const imgElement = roundContainer.querySelector('img');
    if (imgElement) {
      imgElement.remove();
    }
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    drawButton.disabled = false;
    settingsButton.disabled = false;
    onShowGrandWinnerImage();
  };

  /** To open the winner page */
  const onShowWinnerPopup = () => {
    populateWinnerList(slot.winner);
    winnerWrapper.style.display = 'block';
  };

  /** To open the grand winner page */
  const onShowGrandWinnerImage = () => {
    // extract data to get the latest winner
    const latestRound = slot.winner[0];

    // Get the winners array from the latest round
    const latestWinners = latestRound.winners;

    // Get the last winner from the latest winners
    const latestWinner = latestWinners[latestWinners.length - 1];
    if (latestWinner.img !== '') {
      // Create a new img element for the image
      const roundImage = document.createElement('img');
      roundImage.setAttribute('src', latestWinner.img); // Set the image source
      roundImage.setAttribute('alt', `Prize number ${slot.currentPrizeNumber + 1}`); // Set the alt text
      roundImage.style.width = '100%'; // Set the width
      roundImage.style.maxHeight = '280px'; // Set the height
      roundContainer.appendChild(roundImage);
    }
  };

  /** To close the winner page */
  const onWinnerClose = () => {
    settingsContent.scrollTop = 0;
    winnerWrapper.style.display = 'none';
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

  // Click handler for "Draw" button
  drawButton.addEventListener('click', () => {
    slot.names = [
      'Adila',
      'Nur',
      'Adam',
      'Fayyaz',
      'Farid',
      'Safwan',
      'Airis',
      'Felora',
      'Adelia',
      'Johan',
      'Saiful',
      'Ros',
      'Pan Gon',
      'Arturo',
      'Jose',
      'Karen',
      'Bill',
      'Santosh'
    ];
    if (!slot.names.length) {
      onSettingsOpen();
      return;
    }

    slot.spin();
  });

  // Hide fullscreen button when it is not supported
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - for older browsers support
  if (!(document.documentElement.requestFullscreen && document.exitFullscreen)) {
    fullscreenButton.remove();
  }

  // Click handler for "Fullscreen" button
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });

  // Click handler for "Settings" button
  settingsButton.addEventListener('click', onSettingsOpen);

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
    winnerContent.innerHTML = ''; // Clear previous content
    // Iterate through rounds in the winner data
    winnerData.forEach((roundData) => {
      // Create a new label element for the round
      const roundLabel = document.createElement('label');
      roundLabel.setAttribute('for', `name-list-${roundData.roundNumber}`);
      roundLabel.textContent = roundData.roundTitle;
      // Create a new ul element
      const ul = document.createElement('ul');
      // Use forEach for winners array
      roundData.winners.forEach((winner) => {
        const li = document.createElement('li');
        li.textContent = `${winner.number} - ${winner.name}`;
        ul.appendChild(li);
      });
      // Append the label and ul to the winnerContent
      winnerContent.appendChild(roundLabel);
      winnerContent.appendChild(ul);
    });
    // Create buttons
    const discardButton = document.createElement('button');
    discardButton.setAttribute('id', 'winner-close');
    discardButton.setAttribute('class', 'solid-button solid-button--danger');
    discardButton.textContent = 'Close';
    // Append buttons to the winnerContent
    winnerContent.appendChild(discardButton);
    // Add click event listener to the "Discard and close" button
    discardButton.addEventListener('click', onWinnerClose);
  };
})();
