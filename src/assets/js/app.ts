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
  // const prizeNumber = document.getElementById('prize-number') as HTMLButtonElement | null;
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
    && prizeName
    && roundContainer
  )
  ) {
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error(
      'Confetti canvas is not an instance of Canvas. This is possibly a bug.'
    );
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 40;
  const CONFETTI_COLORS = [
    '#26ccff',
    '#a25afd',
    '#ff5e7e',
    '#88ff5a',
    '#fcff42',
    '#ffa62d',
    '#ff36ff'
  ];
  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      ],
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
    // soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
    // prizeNumber.textContent = `Lucky Draw #${slot.currentPrizeNumber}`;
    prizeName.textContent = '';
    const imgElement = roundContainer.querySelector('img');
    if (imgElement) {
      imgElement.remove();
    }
    const lucky = document.getElementById(
      'prize-number'
    ) as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'block';
    }
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    const lucky = document.getElementById(
      'prize-number'
    ) as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'none';
    }
    onShowPrizeName();

    // save data here by call
    // use fetch post
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
      roundImage.setAttribute(
        'alt',
        `Prize number ${slot.currentPrizeNumber + 1}`
      ); // Set the alt text
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
    const lucky = document.getElementById(
      'lucky-draw'
    ) as HTMLDivElement | null;
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
      ? nameListTextArea.value
        .split(/\n/)
        .filter((name) => Boolean(name.trim()))
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
        soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
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
  // login
  const urlLogin = 'http://159.89.198.242:2052/login.php?u=mlng5th&p=dec5th';
  fetch(urlLogin)
    .then((response) => response.json())
    .then((data) => {
      console.log(data, 'login'); // Handle the retrieved data here
    })
    .catch((error) => console.error('Error:', error));

  const url = 'http://159.89.198.242:2052/guest_all.php?event=mlng5th';
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data, 'guest'); // Handle the retrieved data here
      // Mixed Content: The page at 'https://weddie-lucky-draw.onrender.com/' was loaded over HTTPS, but requested an insecure resource 'http://159.89.198.242:2052/login.php?u=mlng5th&p=dec5th'. This request has been blocked; the content must be served over HTTPS.
      // slot.names = data.payload;
    })
    .catch((error) => console.error('Error:', error));

  slot.names = [
    'ABANG YUSUF BIN ABANG PUTEH',
    "HAZZEIR BIN ABDUL MU'IN",
    'ANNABELLA AK PETER DIEN/ARDINI ANNA ABDULLAH',
    'MOHAMED SYAZWAN ABDULLAH @ LAGA',
    'AMIR HAMZAH GHAZALI',
    'JAMURI ZEN',
    'MOHAMMAD FARIZ ROSE DEE',
    'KHAIRUL ARIFFIN IDRIS',
    'OSMAN BUNGGAL',
    'NUR AYUNI PUSTABEL',
    'ARAFFIE IGAT',
    'AZLIN YUSOF',
    'GANANG TAGAL',
    'ABG AZIAN B ABG MOK ',
    'SUHAILLA BINTI PEN',
    'AARON TAN CHI WU',
    'ADELINE MARCIA ALONG ANAK MICHAEL',
    'AMY NUR SYAMIMI MOHAMMAD AZAN',
    'MOHAMMAD KHAIRUL BIN ABU BAKAR ',
    'BIBYEN LAHAK',
    'CHRISTIE USUN YUSUP NGAU',
    'DEBRA ANAK EDWIN',
    'ELIZABETH CLAINEY ANAK AMBROSE JEMUT',
    'FELICIA UBONG ',
    'JENNIFER MUJAN LAWAI',
    'MOHAMMAD RAIMI BIN JAAFAR ',
    'AWANGKU MOHD HAZRIQ FADZLY BIN AWG AHMAD',
    'SITI NURSYAKIRAH BINTI MOHD SURBINI',
    'JELEMBANG TANIE ',
    'NURSYAMIMI NAZIHAH BINTI KASSIM',
    'ALFRED KALALAH',
    'AWG ADIB QAYYUM',
    'RAFIDAH HASHIM ',
    'BEATRICE JAFAR ',
    'DOMINIC TALAB',
    'NANI ARIANA BT YUSOF ',
    'MUHAMAD ASYRAF HADIE ',
    'NUR AINATUL ZAFIRAH ',
    'SARMIZA BT MAHDI ',
    'RACHEAL SYMBAH ',
    'M NUR ALIFF HAIQAL PATRA',
    'FARINA YASMIN ABD MANAP',
    'KHAIRIN HAZMI KAMIL ',
    'FREDERICK CLARENCE SENIN ',
    'HELINA SARANI ANAK SABA',
    'ISKANDAR BIN SENDI',
    'JURITA ANAK AMBOK',
    'KARLOS GANING ANAK DONALD',
    'KHALIDA BINTI CHE RAMBLI @ BANA',
    'MOHD ISMAWIE IDRIS',
    'MOHD 0OR AZRI BIN KARIM',
    'PHILOMINA LIGHTER ',
    'RAYMOND RENTAP ENGKAMAT',
    'SHAHRUL NIZAM BIN JULAIHI',
    'SHAWN THOMAS',
    'STEVEN HWONG LEE KIN',
    'SUFI AS-SYUHADA BINTI KADIR',
    'VICTORIA SOFIA ANAK FRANCIS VICTOR',
    'MUHAMMAD NAZREEN SABLI',
    'DONNA HASLINDA BINTI MOHIDI',
    'MAXIMILIAN KOLBE SARIBU ANAK RAYMOND',
    'JALANI ANAK GIMAN',
    'MARCUS BANTIN ANAK DAMBUL',
    'ARNOLD ENJUK SUPIT ANAK MICHAEL ELLY',
    'LIM CHUONG HIN',
    'FRANKLIN ANAK JINGGAN',
    'NAZEM BIN RAJALI',
    'NOR DANI BIN JALUDIN',
    'MAXWELL ANAK APOI',
    'ALEXSON LIUM ANAK MELAYU',
    'SHUKRI BIN KASDI',
    'SIMON TAKAP',
    'VALDRIN ANAK WESLEY BELAJA',
    'ADI BIN HAMAT',
    'JULIUS ANAK KUNO',
    'EUGENE AMPAS ANAK ANTHONY',
    'MOHAMMAD AIDIL ARDHA BIN DAHAN',
    'BOHARNIZAR BIN THOMAS GETI',
    'YEK CHING KWONG',
    'WAN HASBURLLAH BIN WAN JULIHI',
    'NAZRUN BIN HANIF',
    'MOHD ASRI BIN ZAINI',
    'ABDUL ADI BIN ABDUL RAHIM',
    'MUHAMMAD SYAFIQ BIN NURULHAK',
    'KEITH ASHER SUPIT ANAK KENNEDY SAGA',
    'ANDY NICHOL ANAK GEORGE',
    'GRACE MELIAH ANAK MESA',
    'MC CARTNEY ISSAC GARSTON ANAK CHRISTOPER',
    'ZULKIFLI BIN ISMAIL',
    'ALBERT MORLEY ANAK BERANGAN UNTAL',
    'HARTMAN ANAK JOHNNY',
    'NELSON JUNA ANAK MANG',
    'MUHAMMAD NAZMI BIN ROSLI',
    'HISYAMUDDIN BIN MAHDAR',
    'ANDY ALAN',
    'STEVE MACKENZIE ANAK KAMING',
    'SANDAH ANAK LUANG',
    'DANYI AWING',
    'NG HOCK MAN',
    'DANNY CHIENG LEE WEE',
    'JACQUELINE JANTA ANAK BONIFACE INTANG',
    'ROSELY BIN SAPUAN',
    'MOHAMAD FAIZ BIN BAHARUDDIN',
    'HARDIE HONG',
    'KENNY HU PON NUON',
    'CHAI SET LEE',
    'MOHD ASFA ASYARI BIN MOHD YUSOF',
    'MOHAMAD ARIFFIN BIN KUANG',
    'JAMES BON ANAK JINJANG',
    'JACKSON A/K SARI',
    'LARKSON UMBARN ANAK KANDAU',
    'NICHOLAS ANAK EGOH',
    'MARHANIF BIN MOHD ARAPIAH',
    'DANIEL ANAK WATSON',
    'MOHAMMAD FARITZ BIN ZAINUDIN',
    'KENNY ANAK BALONG',
    'MUHAMMAD ALI BIN SAPONG',
    'RAYNOLD GREG AK JELANI',
    'TEH CHOON CHI',
    'FOO HWA CHIT',
    'MOHD AZLAN BIN AHMAD FUAD',
    'BONG YUNG FOO',
    'KHAIRUL HAFIZEN BIN KHALID',
    'MARCUS CHONG YUNG',
    'MICHELLE KIMBERLY ANAK MICHEAL',
    'MUHAMMAD ZAIM  BIN  ZAHARI',
    'IRENE FUNG HUI WENG',
    'DESMOND BELAJA ANAK DADU',
    'ANWAR BIN LAMZAH',
    'ERIC DAN ZHI WEI',
    'AYUNNI MAISARAH BINTI ROSMINUDDIN',
    'PHUN TECK SIN',
    'GILBERT ANAK DEKUS',
    'KHAIRUL AMIRIN BIN ABDUL RANI',
    'SITI NUR KHAIRUNNISA BINTI MANJA',
    'MOHD HELMI BIN MUSTAFA',
    'MOHD FARID BIN ADAM',
    'SYAFIQ BIN HASHIM',
    'AZREEL BIN ZANIL ABDIN',
    'PATRICIA SUZZANE ANAK JILLUM',
    'LUQMAN BIN ABDOLLAH@ABDULLAH',
    'JAMES BUNGKONG ANAK RIMONG',
    'MOHAMMED FAIRUZZ BIN ALI BASAH',
    'SUFIAN BIN BOLHASSAN',
    'DZUL FAHMI BIN ZAWAWI',
    'DANEL HAKIM BIN MOHAMMAD WEST',
    'ARILDA DIAH ANAK AJAI',
    'ASMAN BIN UDIN',
    'BETHUEL ANAK DANCHI',
    'JAMALUDDIN BIN TALIP',
    'YUSRI BIN SALLEH',
    'BERNARD ENJOB ANAK MUJAN',
    'PHILIP BETI ANAK ROBIN',
    'HANAFI BIN MONIR',
    'WAN ISKANDAR BIN WAN SUAIBON',
    'MOHAMMAD HAFIZ BIN BOLHASSAN',
    'FERGUSON ANAK LUDAN',
    'MOHD SAZLAN BIN SUILI',
    'MOHD HAZWAN BIN ABDULLAH',
    'JELLY BYLAN ANAK JENNIS',
    'SHAREAL ANAK INTAI',
    'JAMES ROOM',
    'MOHAMMAD KHAIRUSRIZUAN BIN KHASIM',
    'SAIFUZZAMAN BIN ANGGAT',
    'MOHD AZIZI BIN BORHAN',
    'GARRY ANAK BAWIN',
    'MOHAMAD FADZLEE BIN KASSIM',
    'PETER ANAK INGKUT',
    'MUHAMMAD ALLIFF BIN RAHIM',
    'MOHAMAD ADIB BIN ISKANDAR',
    'CHERYL ANAK EDWIN',
    'MUHAMMAD AFIQ BIN MUSTAFA',
    'JUANNA ASFARRIENI BINTI MOHAMMAD',
    'AIZZAT BIN KHAIRUDIN',
    'NONA BT RIDWAN',
    'LAU KUNG HUI',
    'MOHD FIRDAUS BIN SAFAR UDIN',
    'JOCELYN JONNA TET',
    'PANG WAN SIN',
    'ROSLAN BIN MUSA',
    'ALICE JONG SUK THING',
    'AHMAD NOR SHERFIQ BIN SHERIMIM',
    'AMIR HAZWAN BIN MOHAMMAD MUSA',
    'SAIFULLAH BIN ABDUL RAHMAN',
    'NORAZMAN BIN AMIN',
    'MUHD. HANIF TARMIZI BIN ABDUL HAJIS',
    'MALIANA BINTI MUSTAPHA ABDULLAH',
    'BAHTIAR BIN IBRAHIM',
    'AHMADI BIN ZAMAWI',
    'MOHAMAD KAMRI BIN ZAINI',
    'MOHAMMAD ABDULLAH BIN GANTEH',
    'AWANG MANTAHA BIN AWANG MOSTAPHA',
    'MORNI BIN ISMAIL',
    'PAUL ANAK JANTING',
    'SOFIAR BIN ABDUL WAHID',
    'FERNANDEZ ANAK MUSA',
    'HADRI BIN HASNI',
    'CASSYDIE ALBERT',
    'RAMFATAYAISYIN BIN RAMLEE',
    'MOHD HAFIZZI BIN MOHD SALLEH',
    'OMARALI BIN BUAH',
    'STIWELL SEMUIN',
    'LIM CHANG SHEH',
    'TIONG YA WEN',
    'ZULFADLI A LATIP',
    'SITI NUR AFIRA BINTI MASBA',
    'ASWANDYE MUSTAPHA',
    'MATHEW ANAK RINGUD',
    'MOHAMMAD ASMAWIE BIN MOHAMED OSMAN',
    'JELAING ANAK JUAN',
    'ELISTER LUNA',
    'MUHAMMAD IZZAT BIN ABD RAHIM',
    'WAN HABIB ALI BIN WAN SHADI',
    'MAZLAN BIN MOHD DIN',
    'SHAMSUL REDZUAN BIN JULAIHI',
    'DAHLAN BIN PON',
    'ROY ANAK ROSALIND',
    'WAN HASRIK BIN WAN SUAIBON',
    'ANDERSON ANAK DISIM',
    'RAZIF BIN MOHAMMAD NOH',
    'GARVINCE ANAK DIYUS',
    'ASMI ABU TALIP',
    'NICHOLAS ANAK CHALI',
    'RITHAUDDEEN BUANG',
    'MOHAMAD NUR NASRULLAH ARON',
    'JAPARI BIN HAMDANI',
    'MUHAMMAD ANIQ LUKMAN BIN SAFRI',
    'ABDUL RAHMAN BIN RAMLI',
    'MOHAMMAD SYAIFUL YAZAN BIN NAKHODA',
    'LAREN KANA ANAK THOMAS',
    'ADRIAN BIN MOHD AMIN',
    'REIDSON RIDZAN ANAK LEONARD LONOD',
    'MOHAMMAD ZUL ALIFFIN BIN ABDUL GAFAR',
    'JACKSON JAWAN ANAK MAJAN',
    'ABDUL HAFIDZ BIN BORHAN',
    'DELLY ANAK SEGAU',
    'CASSIE LIKAU',
    'NORSHOKRI BIN DAUD',
    'WAN NURAZMI BIN WAN AZARI',
    'JAMRI BIN SEBELI',
    'MUHAMMAD ZIKRI NASRULLAH BIN ZAIDEL',
    'MUSTAMI BIN RAMZI',
    'PATRICA KIAH JAMES',
    'SALLEH BIN MORSHIDI',
    'CHRISTIE USUN YUSUP NGAU',
    'LARRY LAUREL LOK AK PAUNG',
    'CHONG WEI LUNG',
    'NAZREEN BINTI SAMSUDIN',
    'KANANG ANAK JARRAU',
    'SULIA ANAK THOMAS IGAH',
    'HRRISON ARIS',
    'SITI NOORILMARNA IRNE HJ RAMLI',
    'MARILYN ANAK SIDI',
    'AFIFA BINTI BAHARIN',
    'NUR SYAZWANA BINTI OMAR',
    'MOHD NAZEEM BIN MOHAMAD SALIM',
    'ABDUL RAHMAN BIN ZAKARIA',
    'AFIQAH BINTI SHAFI-EE',
    'GENEVIEVE MELIA AK GEORGE GLADWYNS TAIT',
    'NURUL HARMIZA BINTI HIPANI',
    'ROSLINE BINTI CHARLES LEMI',
    'AHMAT BIN MATKASSAN',
    'ANDRIA ANAK RUTEL',
    'DITTONY KEE',
    'MARK THIAN',
    'ESWANDI BIN ABDUL KADIR',
    'NELSON NANGGAI ANAK BALLIE',
    'MAZLAN BIN ADENAN',
    'ANTHONY PENGIRAN ANAK MELAKA',
    'ABI SAFWAN BIN UMARUL MUKHTAR',
    'ADRIEL RINGKAI ANAK DENYS',
    'MOHAMMAD NAZREEN BIN ZAINURIN',
    'MOHD FIRDAUS BIN MUSTAFA',
    'ROSNAH BINTI NEE',
    'ANUAR BIN SAPON',
    'JEDIDIAH JOHNNY',
    'VINOD A/L HARIRAM',
    'AISYA SYARINA BINTI MOHD SUHAIMI',
    'AFINA SYAURAH BINTI A AZIZ',
    'MUHAMAD AZRUL HAMZI BIN ABDULLAH',
    'DELIB SHARWEN A/L KATHIRTCHELVAN',
    'DHURAISAMY A/L BALAN',
    'MUHAMMAD IRFAN  BIN  ZAKARIA',
    'NASHUHA BINTI MORSHIDI',
    'UZMA ZULAIKHA BINTI WAHIT',
    'DOMINIC NYARU ANAK MEDAN',
    'NURUL IZZATI  BINTI MOHD WILLIEUDDIN LIM',
    'MUHAMMAD IMAN HAFIZ BIN MUHAMMAD SAZALI',
    'AHMAD AISAMUDDIN AKMAL BIN SAMAT',
    'AGNES ANDANG ANAK NGELAMBUNG',
    'VANESSA ANAK GILBERT',
    'NURUL NADIAH  BINTI  GHAFAR',
    'MOHAMAD TAUFIK BIN ZAINUDDIN',
    'NORSHARIZANA BINTI SHAM',
    'NUR BASYIRAH  BINTI MORTAZA',
    'JAMES ANAK ANTHONY SENGIANG',
    'ABDUL MUIM BIN ABDUL SANI',
    'MOHAMAD SAIFUL RAMAZAN BIN JULAIHIE',
    'NAZRI BIN SALIHIN',
    'FATHUL RIZAN BIN AHMAD',
    'AWG. AFIQAL BIN AWANG ABU SUHARDI',
    'NAZARUDIN BIN KAMALLUDIN',
    'MOHAMAD FAIZ BIN MOHAMAD SALLEH',
    'ANDRE MARTIN JALONG',
    'ALEXSON ANAK JOHN',
    'MAXMILLANCE AJAH ANAK BADOL',
    'YAZID BIN JAIS',
    'MOHD SHARUL AFFENDI BIN ABDUL KARIM',
    'AZARIAS PEPIN ANAK NICHOLAS',
    'AMIRUL AZWAN BIN ANNUAL ONG',
    'JUSTINE ANAK JAPOK',
    'MOHD SHAZULNIZAM BIN FAISAL',
    'HUGO ANAK BENJAMIN',
    'NORSAIDIN BIN DAUD',
    'DENNIS CHAN',
    'MOHAMED EZZEDDEN BIN JARAWI',
    'MATTHIAS ANAK KOMA',
    'FREDDEUS FARLVIEN ANAK EMPALING',
    'DARRYL RECCO LAWAI SIM',
    'FIRDAUS BIN MAT',
    'DONNEY MON MENG CHIK',
    'MOHD ASYRAF BIN MOHD RASLIM',
    'ALFA ANAK JUEL',
    'RAGAI ANAK GANI',
    'SYAIFUL RIZAL BIN DILLAH',
    'MOHD AFIZIE BIN SAPIAN',
    'ABDUL LATIFF BIN ABDUL RANI',
    'AARON TUSAN TRANG',
    'NICHOLAS ADOH ANAK JACOB',
    'JANISE JELAN ANAK LAJA',
    'MOHAMAD SHAFIK BIN PERSIDEN',
    'MOHD IKHWAN BIN MOHD GAUS',
    'SAFRI NUR AIMAN NGO BIN ABDUL KARIM NGO',
    'NORZAINI BIN MUSTAPHA',
    'KHAIRUL AZIZI BIN MINHAT',
    'TEO EIK KIAT',
    'KENT ANAK JOTO @ JOTE',
    'AMBROSE CHIN',
    'MUHAMMAD HAMIZAN BIN RAZNI',
    'DESMOND ANAK GEORGE',
    'JOHN VIANNEY ANAK BENEDICT',
    'JOE CHIO SHUI HOW',
    'ROLAND MATTHEW RUJI',
    'JUSTIN BIN SELUROH',
    'ABANG YUSRIN HAKIM BIN ABANG DRAHMAN',
    'MUHAMAD SAHARUDIN BIN ZINAL ABIDINE',
    'ABDUL AMZAR BIN AZHAR',
    'JEFFERY ANAK JIMBAT',
    'FADZILLAH BIN WAHID',
    'FAZRIL FARDLI BIN SUHAILI',
    'CALVIN ELIEZER ANAK GANDA',
    'SYLVESTER SINGKA ANAK SUJANG',
    'ALBUIN ANAK EDMUND',
    'YEOH CHEE KHOON',
    'JOHNSONLY ANAK UGAI',
    'SUN CASSIDY LUWIE ANAK LAPOK',
    'RAYMOND MOSS ANAK DEWI',
    'MOHD SABRIEE BIN SERAH',
    'JAMES LIM',
    'MOHAMMAD AFFENDI BIN ABDULLAH',
    'LEE ANAK BUJA',
    'SUDING @ BALA ANAK SANGAUK',
    'JOS KANANG ANAK AMBAK',
    'MOHAMAD FAIZAL BIN ULIS',
    'LIM KUEH MING',
    'HAFISZUDDIN BIN BOLHASSAN',
    'ADRIAN APOI LENJAU',
    'CORNELIUS ANAK PHILIP',
    'MUHAMMAD FARIQ BIN OMAR ALI',
    'ADIASPHIA BIN JUNAIDI',
    'MOHAMAD AL-QAYUM BIN SALAM',
    'MUSA BAKRI BIN IBRAHIM',
    'ABANG AMIRUDIN BIN ABANG ABDUL GAPOR',
    'HARRIS MATAN ANAK TUAN',
    'MUHAMMAD HAIZAM BIN MOHD JAMALI',
    'IZWAN BIN JAIS',
    'TAY KAN MENG',
    'MOHD. AZRI BIN KIPLI',
    'PETRUS ANAK MARNEAN',
    'MATTEUS EDISON ANAK JAMES BEROK',
    'AZROL BIN BUNSU',
    'DESMOND ANAK DIONG',
    'ZULQHAIRIE BIN ROSLAN',
    'ZERDDRIE ANAK EDWARD',
    'MOHD. SHAHRUL BIN MOHAMAD',
    'HASRUL BIN AIS',
    'HASAN BIN MASRI',
    'AWG MOHAMMAD FAIRUL BIN AWG BOLHAN',
    'MOHAMAD NOR IZHAMKA BIN YAKUP',
    'RICHIELES BIN JOSEPH',
    'VELDINE ANAK LIAW CHIN',
    'FAKHRURROZI IQBAL BIN ZAINALABIDIN',
    'ASHLEY BIN MORIS',
    'DANIEL YONG CHEW HUA',
    'AWGKU AZHARUDIN BIN AWG MORNI',
    'SARBEKI BIN BUSHRI',
    'PAUL NGAU WAN',
    'KUAN VUI HIONG',
    'MOHAMAD SABRIE BIN HASAN',
    'HELTON SAYANG ANAK BONIFACE ENTALANG',
    'SAYYID IQBAL BIN AINI',
    'GARY LEJAU MATHEW',
    'LESTER ANAK NYOEP',
    'MOHAMAD SAIFUL BIN MOHAMAD SAHARI',
    'DONNY ANAK MAMAT',
    'ALEXON GUNN ANAK RENDOM',
    'MUHAMMAD NUR AMIRA BIN JAMERI',
    'MOHAMMAD SUKRI BIN RASIT',
    'JOLEONUS MIGGI ANAK BINUS',
    'PATRICK PINGAN HANK',
    'LUTAU ANAK ULI',
    'AHMAD EDDY FADLY BIN OMAR ALI',
    'AWANG SAIHADI BIN AWANG SAINI',
    'MOHAMAD ISROZAIME BIN DILLAH',
    'AMIRUL AFDHALURRAHHIM JAUZI BIN SUHAILI',
    'AFZANDILLAH BIN MOHAMAD',
    'MOHAMAD SOPIAN BIN BAHA @ MAJIDI',
    'JUWIS ANAK SARANG',
    'HYGINUS SCOT ANAK MAPE',
    'MOHAMAD HANIF BIN RAIM',
    'EDGAR MARTIA RESSA ANAK ANDREW MAT',
    'KENNETH A/K CLEMENT ETAN',
    'BAKIT ANAK BIDAT',
    'OZEA BIN WAHED',
    'ASHLEY EDIT ANAK CLIFFARD',
    'HELMI BIN RAZALI',
    'FAIZUL BIN ABIT',
    'OSMAN BIN NARAWI',
    'WILFRED CHARLES ANAK ROJERS',
    'YONG YEW JIUH',
    'NOEL BARO ANAK NABAU',
    'SAMI-ONN BIN PAWI',
    'GERMAN AK SEGAU',
    'MOHAMAD FAIZAL BIN SAMAT',
    'MOHAMMAD SHAHRIL BIN DORAHMAN',
    'DWIGHT NILLY LAWRENCE',
    'JUING ANAK BANTAN',
    'AWANG ZEKRYANTO BIN AWANG BUJANG',
    'JOSHUA GAU BERNARD',
    'SLYVESTER ANAK HONG PING',
    'WILTER ANAK BIDAH',
    'DRICKBONNIE ANAK CLEMENT IGOH',
    'VENOM ABUN ANAK UNCHAT',
    'FRANKIE ANAK KANYAN',
    'LIZA ANAK RANGGI',
    'AZLAN HUSIN BIN ABDUL RAHIM',
    'WONG AIK CHING',
    'SIDNEY ANAK CHARLES JUTA',
    'ANNIE IGANG',
    'MELISSA LINDLEY RINCHANG',
    'TING TIEW SING',
    'ROHAYATI BINTI JAINI',
    'NUR AZIATI AZMAN',
    'LEE CHOON LI',
    'NORMARDIANA BINTI OTHMAN ',
    'CHE MOHD NUR ADLY B CHE ADNEN',
    'CHEALSEA YVONNE ANAK KAT',
    'FARIZAH AMRI',
    'ZULHILMI BIN USOP@YUSUF',
    'ABUK JALAI',
    'FAUZIAH IBRAHIM',
    'JAMALIA MUSTAPHA',
    'JIMMY HENRY NUGA',
    'KENNEDY DAS',
    'KENNY MUJAN',
    'LOGENTHIRAN MANOGARAN',
    'NUR MISUARI HAMDI',
    'ROY LIBAU',
    'SUKRE KASSIM',
    'MOHAMAD FAIZAL BIN FAKRUDDIN',
    'YULNAIKEY BIN MOHD YUSOFF',
    'LEONARD WONG BAK HUAT',
    'MAJORIE TELUN AVIT',
    'JACQUELINE KONG PEI KIE',
    'QUENDALYN PAYA WAN',
    'NAZARUDIN BIN JAHIDIN',
    'ABDUL SHAFIQ BIN HASSAN',
    'BOLHASSAN BIN ROSLI',
    'TANG KAH TEE',
    'HARWINA HAYU BINTI AHMAD',
    'RABIATUL ADAWIYAH BINTI ABDULLAH',
    'AHMAD ZAIDI BIN AHMAD LATIFFI',
    'ZURIAH BINTI AHMAD',
    'HARRIHARAN A/L REMASH',
    'MICHEL MERING',
    'EDKONA JENANG EDWARD',
    'KENNY RAMIREZ ANAK THOMAS SAUH',
    'JIMMY ANAK LANIE',
    'YEO SZE YAW',
    'MOHAMAD SUMADI BIN TAHA',
    'MICHAEL RAYONG ANAK MORGAN',
    'AZREENA AZIAH JASMINE BINTI AZIZAN',
    'SITI FARHANA BINTI MOHD SHAARI',
    'CHEW PAN HAO',
    'NORMAH BINTI BUJANG',
    'TIEH SING CHING',
    'JUNAIZA BINTI ABDUL RAHMAN @ JUNID',
    'TIMOTHY NEX ANAK BETIN',
    'CHARLES ALVIN ANAK TEDONG',
    'MOHD NUR AZMAN BIN MUSA',
    'AZKHAMIZUL RAHMAN BIN MATSAH',
    'NICHOLAS INGAN ANAK KAPOK',
    'SUPRI BIN MUSTAPHER',
    'UNTOL ANAK UJAN',
    'DYGKU NURAYSYAH LEE BT. AWANG JIDEL',
    'VITO ANAK AMIN',
    'NUR ARNISZA BINTI RAJAN',
    'WAN AMIRUL AZMIL BIN WAN SHADI',
    'AWANGKU ADAM BIN AWANG SABELI',
    'EZZAH AZWANY BINTI KHAIRUL NASIR',
    'HAMZI BIN MOHAMMAD',
    'VIKNESWARAN A/L ANALAGAN',
    "NURSYIFAA' BINTI DAHANI",
    'KHADIZAH BINTI WAHI',
    'ANWAR FARID BIN SHAHUDIN',
    'LANGI ANAK AGANG',
    'SITI MARLINA BINTI AHMAD MAKASAR',
    'ALVIN PEI CHUN HAU',
    'CHANG YUEN LOONG'
  ];
})();
