/* eslint-disable no-plusplus */
interface Winner {
  number: number;
  name: string;
  img: string;
  prize: string;
}
interface WinnerListItem {
  setTitle: string;
  winners: Winner[];
}
interface SlotConfigurations {
  /** User configuration for maximum item inside a reel */
  maxReelItems?: number;
  /** User configuration for whether winner should be removed from name list */
  removeWinner?: boolean;
  /** User configuration for element selector which reel items should append to */
  reelContainerSelector: string;
  /** User configuration for callback function that runs before spinning reel */
  onSpinStart?: () => void;
  /** User configuration for callback function that runs after spinning reel */
  onSpinEnd?: () => void;

  /** User configuration for callback function that runs after user updates the name list */
  onNameListChanged?: () => void;

  /** User configuration to show winner popup */
  onShowWinnerPopup?: () => void;
}

/** Class for doing random name pick and animation */
export default class Slot {
  /** List of names to draw from */
  private nameList: string[];

  /** List of winners */
  private winnerList: WinnerListItem[] = [];

  /** Prize Number */
  private prizeNumber: number;

  /** Whether there is a previous winner element displayed in reel */
  private havePreviousWinner: boolean;

  /** Container that hold the reel items */
  private reelContainer: HTMLElement | null;

  /** Maximum item inside a reel */
  private maxReelItems: NonNullable<SlotConfigurations['maxReelItems']>;

  /** Whether winner should be removed from name list */
  private shouldRemoveWinner: NonNullable<SlotConfigurations['removeWinner']>;

  /** Reel animation object instance */
  private reelAnimation?: Animation;

  /** Callback function that runs before spinning reel */
  private onSpinStart?: NonNullable<SlotConfigurations['onSpinStart']>;

  /** Callback function that runs after spinning reel */
  private onSpinEnd?: NonNullable<SlotConfigurations['onSpinEnd']>;

  /** Callback function that runs after spinning reel */
  private onNameListChanged?: NonNullable<SlotConfigurations['onNameListChanged']>;

  /** Callback function that show winner popup */
  private onShowWinnerPopup?: NonNullable<SlotConfigurations['onShowWinnerPopup']>;

  /**
   * Constructor of Slot
   * @param maxReelItems  Maximum item inside a reel
   * @param removeWinner  Whether winner should be removed from name list
   * @param reelContainerSelector  The element ID of reel items to be appended
   * @param onSpinStart  Callback function that runs before spinning reel
   * @param onNameListChanged  Callback function that runs when user updates the name list
   * @param onShowWinnerPopup Callback function that show winner popup
   */
  constructor(
    {
      maxReelItems = 30,
      removeWinner = true,
      reelContainerSelector,
      onSpinStart,
      onSpinEnd,
      onNameListChanged,
      onShowWinnerPopup
    }: SlotConfigurations
  ) {
    this.nameList = [];
    this.winnerList = [];
    this.prizeNumber = 150;
    this.havePreviousWinner = false;
    this.reelContainer = document.querySelector(reelContainerSelector);
    this.maxReelItems = maxReelItems;
    this.shouldRemoveWinner = removeWinner;
    this.onSpinStart = onSpinStart;
    this.onSpinEnd = onSpinEnd;
    this.onNameListChanged = onNameListChanged;
    this.onShowWinnerPopup = onShowWinnerPopup;

    // Create reel animation
    this.reelAnimation = this.reelContainer?.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        { filter: 'blur(1px)', offset: 0.5 },
        // Here we transform the reel to move up and stop at the top of last item
        // "(Number of item - 1) * height of reel item" of wheel is the amount of pixel to move up
        // 7.5rem * 16 = 120px, which equals to reel item height
        { transform: `translateY(-${(this.maxReelItems - 1) * (7.5 * 16)}px)`, filter: 'blur(0)' }
      ],
      {
        duration: this.maxReelItems * 100, // 100ms for 1 item
        easing: 'ease-in-out',
        iterations: 1
      }
    );

    this.reelAnimation?.cancel();
  }

  /**
   * Setter for name list
   * @param names  List of names to draw a winner from
   */
  set names(names: string[]) {
    this.nameList = names;

    const reelItemsToRemove = this.reelContainer?.children
      ? Array.from(this.reelContainer.children)
      : [];

    reelItemsToRemove
      .forEach((element) => element.remove());

    this.havePreviousWinner = false;

    if (this.onNameListChanged) {
      this.onNameListChanged();
    }
  }

  /** Getter for name list */
  get names(): string[] {
    return this.nameList;
  }

  /** Getter for winner list */
  get winner(): WinnerListItem[] {
    return this.winnerList;
  }

  /** Getter for prize number */
  get currentPrizeNumber(): number {
    return this.prizeNumber;
  }

  /**
   * Setter for shouldRemoveWinner
   * @param removeWinner  Whether the winner should be removed from name list
   */
  set shouldRemoveWinnerFromNameList(removeWinner: boolean) {
    this.shouldRemoveWinner = removeWinner;
  }

  /** Getter for shouldRemoveWinner */
  get shouldRemoveWinnerFromNameList(): boolean {
    return this.shouldRemoveWinner;
  }

  /**
   * Returns a new array where the items are shuffled
   * @template T  Type of items inside the array to be shuffled
   * @param array  The array to be shuffled
   * @returns The shuffled array
   */
  private static shuffleNames<T = unknown>(array: T[]): T[] {
    const keys = Object.keys(array) as unknown[] as number[];
    const result: T[] = [];
    for (let k = 0, n = keys.length; k < array.length && n > 0; k += 1) {
      // eslint-disable-next-line no-bitwise
      const i = Math.random() * n | 0;
      const key = keys[i];
      result.push(array[key]);
      n -= 1;
      const tmp = keys[n];
      keys[n] = key;
      keys[i] = tmp;
    }
    return result;
  }

  /**
   * Function for spinning the slot
   * @returns Whether the spin is completed successfully
   */
  public async spin(): Promise<boolean> {
    const prizeData = {
      prizes: [
        { number: 1, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 2, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 3, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 4, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 5, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 6, name: 'SONY PS5 DISC VERSION CFI-1218A', img: 'ps5.png' },
        { number: 7, name: 'DYSON V8 SLIM FLUFFY PLUS CORDLESS VACUUM', img: 'dyson.png' },
        { number: 8, name: 'APPLE IPAD 10TH GEN/WIFI/64GB/10.9"', img: 'ipad.png' },
        { number: 9, name: 'ELECTROLUX 8.5KG FRONT LOAD VENTING DRYER EDV854J3WD', img: 'electrolux.png' },
        { number: 10, name: 'SAMSUNG 50" CRYSTAL UHD 4K SMART TV UA50AU7000KXXM', img: 'tv.png' },
        { number: 11, name: 'PHILIPS PERFECTCARE 7000 SERIES STEAM GENERATORPSG7130/20', img: '' },
        { number: 12, name: 'PHILIPS PERFECTCARE 7000 SERIES STEAM GENERATORPSG7130/20', img: '' },
        { number: 13, name: 'SWITCH VOUCHER (WORTH RM 1500.00)', img: '' },
        { number: 14, name: 'SWITCH VOUCHER (WORTH RM 1500.00)', img: '' },
        { number: 15, name: 'SAMSUNG GALAXY A34 5G 8GB + 256GB GRAPHITE', img: '' },
        { number: 16, name: 'SAMSUNG GALAXY A34 5G 8GB + 256GB GRAPHITE', img: '' },
        { number: 17, name: 'SONY WIRELESS NOISE CANCELLING HEADPHONES WH1000XM5', img: '' },
        { number: 18, name: 'SONY WIRELESS NOISE CANCELLING HEADPHONES WH1000XM5', img: '' },
        { number: 19, name: 'SAMSUNG SOUND TOWER MX-T70/XM', img: '' },
        { number: 20, name: 'SAMSUNG SOUND TOWER MX-T70/XM', img: '' },
        { number: 21, name: 'HP 15-FD0182TU INTEL PROCESSOR N100/8GB DDR4 3200/512GB PCIE/UHD/15.6" FHD/W11H/HNS/1YW/WARM GOLD', img: '' },
        { number: 22, name: 'SAMSUNG 60M2 SMART AIR PURIFIER AX46BG5000GSME', img: '' },
        { number: 23, name: 'SAMSUNG 60M2 SMART AIR PURIFIER AX46BG5000GSME', img: '' },
        { number: 24, name: 'SAMSUNG 11KG TOP LOAD WASHER WITH ECOBUBBLE', img: '' },
        { number: 25, name: 'SAMSUNG 11KG TOP LOAD WASHER WITH ECOBUBBLE', img: '' },
        { number: 26, name: 'NINTENDO SWITCH OLED', img: '' },
        { number: 27, name: 'NINTENDO SWITCH OLED', img: '' },
        { number: 28, name: 'MIDEA 8.0KG CONDENSER CLOTHES DRYER MD-C8800', img: '' },
        { number: 29, name: 'MIDEA 8.0KG CONDENSER CLOTHES DRYER MD-C8800', img: '' },
        { number: 30, name: 'SAMSUNG GALAXY WATCH 6 CLASSIC 43MM BLACK', img: '' },
        { number: 31, name: 'SAMSUNG GALAXY WATCH 6 CLASSIC 43MM BLACK', img: '' },
        { number: 32, name: 'SAMSUNG POWERBOT VACUUM VR05R5050WK', img: '' },
        { number: 33, name: 'SAMSUNG POWERBOT VACUUM VR05R5050WK', img: '' },
        { number: 34, name: 'SAMSUNG JET70 MULTI POWERSTICK VACUUM CLEANER', img: '' },
        { number: 35, name: 'SAMSUNG JET70 MULTI POWERSTICK VACUUM CLEANER', img: '' },
        { number: 36, name: 'SAMSUNG 2 DOOR REFRIGERATOR 270L RT22FARADSA/ME', img: '' },
        { number: 37, name: 'SAMSUNG 2 DOOR REFRIGERATOR 270L RT22FARADSA/ME', img: '' },
        { number: 38, name: 'APPLE WATCH SE - STARLIGHT', img: '' },
        { number: 39, name: 'APPLE WATCH SE - STARLIGHT', img: '' },
        { number: 40, name: 'FUJIFILM INSTAX MINI FILM EVO (+5 BOX FILMS)', img: '' },
        { number: 41, name: 'FUJIFILM INSTAX MINI FILM EVO (+5 BOX FILMS)', img: '' },
        { number: 42, name: 'Bluetooth Gaming Controller', img: '' },
        { number: 43, name: '(COACH) TABBY 12', img: '' },
        { number: 44, name: '(COACH) CHARTER BELT BAG 7 IN SIGNATURE CANVAS', img: '' },
        { number: 45, name: 'ELECTRIC SCOOTER', img: '' },
        { number: 46, name: 'AIRCOND SAMSUNG', img: '' },
        { number: 47, name: 'APPLE AIRPODS PRO 2TH GEN', img: '' },
        { number: 48, name: 'APPLE AIRPODS PRO 2TH GEN', img: '' },
        { number: 49, name: 'MIDEA MUF-208SD UPRIGHT FREEZER', img: '' },
        { number: 50, name: 'MIDEA MUF-208SD UPRIGHT FREEZER', img: '' },
        { number: 51, name: 'PHILIPS COOKING BLENDER HR 2099', img: '' },
        { number: 52, name: 'PHILIPS COOKING BLENDER HR 2099', img: '' },
        { number: 53, name: 'PHILIPS COOKING BLENDER HR 2099', img: '' },
        { number: 54, name: 'SAMSUNG GALAXY WATCH 5 40MM, GRAY, SM-R900NZAAXME', img: '' },
        { number: 55, name: 'SAMSUNG GALAXY WATCH 5 40MM, GRAY, SM-R900NZAAXME', img: '' },
        { number: 56, name: 'SAMSUNG GALAXY WATCH 5 40MM, GRAY, SM-R900NZAAXME', img: '' },
        { number: 57, name: 'SSF VOUCHER (WORTH RM 750.00)', img: '' },
        { number: 58, name: 'SSF VOUCHER (WORTH RM 750.00)', img: '' },
        { number: 59, name: 'SSF VOUCHER (WORTH RM 750.00)', img: '' },
        { number: 60, name: 'GARDEN BBQ SET', img: '' },
        { number: 61, name: 'GARDEN BBQ SET', img: '' },
        { number: 62, name: 'GARDEN BBQ SET', img: '' },
        { number: 63, name: 'SONY 5.1CH HOME CINEMA SOUNDBAR SYSTEM HT-S20R', img: '' },
        { number: 64, name: 'SONY 5.1CH HOME CINEMA SOUNDBAR SYSTEM HT-S20R', img: '' },
        { number: 65, name: 'SONY 5.1CH HOME CINEMA SOUNDBAR SYSTEM HT-S20R', img: '' },
        { number: 66, name: 'MIRI MARRIOTT RESORT & SPA Premier Garden Room 3D2N(inclusive breakfast for two persons)', img: '' },
        { number: 67, name: 'MIRI MARRIOTT RESORT & SPA Premier Garden Room 3D2N(inclusive breakfast for two persons)', img: '' },
        { number: 68, name: 'MIRI MARRIOTT RESORT & SPA Premier Garden Room 3D2N(inclusive breakfast for two persons)', img: '' },
        { number: 69, name: 'PANASONIC RICE COOKER SR-HL151KSK', img: '' },
        { number: 70, name: 'PANASONIC RICE COOKER SR-HL151KSK', img: '' },
        { number: 71, name: 'PANASONIC RICE COOKER SR-HL151KSK', img: '' },
        { number: 72, name: 'PHILIPS ROBOTIC VACUUM CLEANER FC8794/01', img: '' },
        { number: 73, name: 'PHILIPS ROBOTIC VACUUM CLEANER FC8794/01', img: '' },
        { number: 74, name: 'PHILIPS ROBOTIC VACUUM CLEANER FC8794/01', img: '' },
        { number: 75, name: 'SONY PORTABLE WIRELESS SPEAKER SRS-XE300', img: '' },
        { number: 76, name: 'SONY PORTABLE WIRELESS SPEAKER SRS-XE300', img: '' },
        { number: 77, name: 'SONY PORTABLE WIRELESS SPEAKER SRS-XE300', img: '' },
        { number: 78, name: 'PHILIPS DELUXE ALL-IN-ONE MULTICOOKER HD2145/62', img: '' },
        { number: 79, name: 'PHILIPS DELUXE ALL-IN-ONE MULTICOOKER HD2145/62', img: '' },
        { number: 80, name: 'PHILIPS DELUXE ALL-IN-ONE MULTICOOKER HD2145/62', img: '' },
        { number: 81, name: 'CE INTERGRATED 150L DUAL CONTROL ELECTRIC OVEN CEO-150SS (E)', img: '' },
        { number: 82, name: 'CE INTERGRATED 150L DUAL CONTROL ELECTRIC OVEN CEO-150SS (E)', img: '' },
        { number: 83, name: 'NINTENDO SWITCH LITE GAMES', img: '' },
        { number: 84, name: 'NINTENDO SWITCH LITE GAMES', img: '' },
        { number: 85, name: 'SAMSUNG 7.0 KG FULLY AUTO WASHING MACHINEWA70H4000SG/FQ', img: '' },
        { number: 86, name: 'SAMSUNG 7.0 KG FULLY AUTO WASHING MACHINEWA70H4000SG/FQ', img: '' },
        { number: 87, name: 'SAMSUNG 30L GRILL MICROWAVE OVEN HEALTHY GRILL FLY', img: '' },
        { number: 88, name: 'SAMSUNG 30L GRILL MICROWAVE OVEN HEALTHY GRILL FLY', img: '' },
        { number: 89, name: 'PHILIPS STEAM IRON BOARD V2 GC7846/86', img: '' },
        { number: 90, name: 'PHILIPS STEAM IRON BOARD V2 GC7846/86', img: '' },
        { number: 91, name: 'SAMSUNG B- SERIES SOUNDBAR C450 BLACK', img: '' },
        { number: 92, name: 'SAMSUNG B- SERIES SOUNDBAR C450 BLACK', img: '' },
        { number: 93, name: 'PANASONIC 32" LED HD TV TH-32H410K', img: '' },
        { number: 94, name: 'PANASONIC 32" LED HD TV TH-32H410K', img: '' },
        { number: 95, name: 'GLOW AESTHETIC CASH VOUCHER (WORTH RM 700)', img: '' },
        { number: 96, name: 'GLOW AESTHETIC CASH VOUCHER (WORTH RM 700)', img: '' },
        { number: 97, name: 'PHILIPS 6.2L XL ESSENTIAL AIR FRYER WITH NUTRIU APHD9280/91', img: '' },
        { number: 98, name: 'PHILIPS 6.2L XL ESSENTIAL AIR FRYER WITH NUTRIU APHD9280/91', img: '' },
        { number: 99, name: 'TTRACING DUO V4 PRO AIR THREADS FABRIC GAMING CHAIR', img: '' },
        { number: 100, name: 'TTRACING DUO V4 PRO AIR THREADS FABRIC GAMING CHAIR', img: '' },
        { number: 101, name: 'FARLEY VOUCHER (WORTH RM500)', img: '' },
        { number: 102, name: 'FARLEY VOUCHER (WORTH RM500)', img: '' },
        { number: 103, name: 'FARLEY VOUCHER (WORTH RM500)', img: '' },
        { number: 104, name: 'PARKSON VOUCHER (WORTH RM 500)', img: '' },
        { number: 105, name: 'PARKSON VOUCHER (WORTH RM 500)', img: '' },
        { number: 106, name: 'PARKSON VOUCHER (WORTH RM 500)', img: '' },
        { number: 107, name: 'H & M CASH VOUCHER (WORTH RM 500)', img: '' },
        { number: 108, name: 'H & M CASH VOUCHER (WORTH RM 500)', img: '' },
        { number: 109, name: 'H & M CASH VOUCHER (WORTH RM 500)', img: '' },
        { number: 110, name: 'UNIQLO CASH VOUCHER (WORTH RM 500)', img: '' },
        { number: 111, name: 'UNIQLO CASH VOUCHER (WORTH RM 500)', img: '' },
        { number: 112, name: 'UNIQLO CASH VOUCHER (WORTH RM 500)', img: '' },
        { number: 113, name: 'PANASONIC 25L MICROWAVE NN-ST34NBMPQ', img: '' },
        { number: 114, name: 'PANASONIC 25L MICROWAVE NN-ST34NBMPQ', img: '' },
        { number: 115, name: 'PANASONIC 25L MICROWAVE NN-ST34NBMPQ', img: '' },
        { number: 116, name: 'VSPA VOUCHER (WORTH RM 500)', img: '' },
        { number: 117, name: 'VSPA VOUCHER (WORTH RM 500)', img: '' },
        { number: 118, name: 'VSPA VOUCHER (WORTH RM 500)', img: '' },
        { number: 119, name: 'SONY 2.1CH SOUND BAR HT-S100F//C', img: '' },
        { number: 120, name: 'SONY 2.1CH SOUND BAR HT-S100F//C', img: '' },
        { number: 121, name: 'SONY 2.1CH SOUND BAR HT-S100F//C', img: '' },
        { number: 122, name: 'PHILIPS AIR FRYER HD9218/51', img: '' },
        { number: 123, name: 'PHILIPS AIR FRYER HD9218/51', img: '' },
        { number: 124, name: 'PHILIPS AIR FRYER HD9218/51', img: '' },
        { number: 125, name: 'SAMSUNG SOUNDBAR SYSTEM, HW-T420', img: '' },
        { number: 126, name: 'SAMSUNG SOUNDBAR SYSTEM, HW-T420', img: '' },
        { number: 127, name: 'SAMSUNG SOUNDBAR SYSTEM, HW-T420', img: '' },
        { number: 128, name: 'PANASONIC FOOD PROCESSOR MK-F510', img: '' },
        { number: 129, name: 'PANASONIC FOOD PROCESSOR MK-F510', img: '' },
        { number: 130, name: 'PANASONIC FOOD PROCESSOR MK-F510', img: '' },
        { number: 131, name: 'ELBA SLOW JUICER ESJ-K6015 (RD)', img: '' },
        { number: 132, name: 'ELBA SLOW JUICER ESJ-K6015 (RD)', img: '' },
        { number: 133, name: 'KHIND 1200W 2L COMMERCIAL BLENDER BL-2000P', img: '' },
        { number: 134, name: 'KHIND 1200W 2L COMMERCIAL BLENDER BL-2000P', img: '' },
        { number: 135, name: 'MIDEA AIR PURIFIER BD,APPLICATION AREA 20M2', img: '' },
        { number: 136, name: 'MIDEA AIR PURIFIER BD,APPLICATION AREA 20M2', img: '' },
        { number: 137, name: 'MIDEA 60L MINI BAR MDRD88FGD30, BLACK', img: '' },
        { number: 138, name: 'MIDEA 60L MINI BAR MDRD88FGD30, BLACK', img: '' },
        { number: 139, name: 'FUJIFILM INSTAX MINI 12', img: '' },
        { number: 140, name: 'FUJIFILM INSTAX MINI 12', img: '' },
        { number: 141, name: 'KHIND BOWL DRYER BD 919', img: '' },
        { number: 142, name: 'KHIND BOWL DRYER BD 919', img: '' },
        { number: 143, name: 'MIDEA ANTI DUST MITES VACUUM CLEANER, 450W MD-MVCB500VM', img: '' },
        { number: 144, name: 'MIDEA ANTI DUST MITES VACUUM CLEANER, 450W MD-MVCB500VM', img: '' },
        { number: 145, name: 'KHIND 1000W 5.0L STAND MIXER SM-506P', img: '' },
        { number: 146, name: 'KHIND 1000W 5.0L STAND MIXER SM-506P', img: '' },
        { number: 147, name: 'PANASONIC 4L BINCHOTAN THERMO POT NC-EG4000PSK', img: '' },
        { number: 148, name: 'PANASONIC 4L BINCHOTAN THERMO POT NC-EG4000PSK', img: '' },
        { number: 149, name: 'MIDEA REMOTE MULTI FUNCTION AIR COOLING MAC-107', img: '' },
        { number: 150, name: 'MIDEA REMOTE MULTI FUNCTION AIR COOLING MAC-107', img: '' }
      ]
    };
    if (!this.nameList.length) {
      console.error('Name List is empty. Cannot start spinning.');
      return false;
    }

    if (this.onSpinStart) {
      this.onSpinStart();
    }

    const { reelContainer, reelAnimation, shouldRemoveWinner } = this;
    if (!reelContainer || !reelAnimation) {
      return false;
    }

    // Shuffle names and create reel items
    let randomNames = Slot.shuffleNames<string>(this.nameList);

    while (randomNames.length && randomNames.length < this.maxReelItems) {
      randomNames = [...randomNames, ...randomNames];
    }

    randomNames = randomNames.slice(0, this.maxReelItems - Number(this.havePreviousWinner));

    const fragment = document.createDocumentFragment();

    randomNames.forEach((name) => {
      const newReelItem = document.createElement('div');
      // Add a number to the name if it's the last one
      newReelItem.innerHTML = name;
      fragment.appendChild(newReelItem);
    });
    if (this.prizeNumber <= 10) {
      reelContainer.appendChild(fragment);
    }
    // console.log('Displayed items: ', randomNames);
    console.log('Name List: ', this.nameList);
    console.log('Winner: ', randomNames[randomNames.length - 1]);

    // set winners array
    const winnersWithPrize: Winner[] = [];
    console.log(this.prizeNumber, 'this.prizeNumber1');

    if (this.prizeNumber > 10) {
      // Add 10 winners to the array with unique numbers and decrease prizeNumber
      for (let i = 0; i < 10; i++) {
        const winner = {
          number: this.prizeNumber - i, // Decrease prizeNumber
          name: randomNames[randomNames.length - 1 - i], //
          img: '',
          prize: ''
        };
        const prize = prizeData.prizes.find((p) => p.number === winner.number);
        if (prize) {
          winner.img = `assets/images/prize/${prize.img}`;
          winner.prize = prize.name;
        }
        winnersWithPrize.push(winner);
      }
    } else {
      // Add only one winner to the array with a unique number and increment prizeNumber
      const winner = {
        number: this.prizeNumber,
        name: randomNames[randomNames.length - 1],
        img: '',
        prize: ''
      };
      const prize = prizeData.prizes.find((p) => p.number === this.prizeNumber);
      console.log(prize, 'prize');
      if (prize) {
        winner.img = `assets/images/prize/${prize.img}`;
        winner.prize = prize.name;
      }
      winnersWithPrize.push(winner);
    }
    const roundIndex = this.getRoundIndex();

    let title = '';
    if (this.prizeNumber <= 10) {
      title = 'GRAND SET';
    } else if (this.prizeNumber <= 50) {
      title = 'SEMI GRAND SET';
    } else if (this.prizeNumber <= 100) {
      title = 'SET 2';
    } else if (this.prizeNumber <= 150) {
      title = 'SET 1';
    }
    if (this.prizeNumber === 10) {
      // Push 1 winner
      this.winnerList.push({
        setTitle: title,
        winners: [winnersWithPrize[0]]
      });
    } else if (this.prizeNumber <= 9) {
      this.winnerList[roundIndex].winners.push(winnersWithPrize[0]);
    } else {
      // Push 10 winner
      this.winnerList.push({
        setTitle: title,
        winners: winnersWithPrize
      });
      if (this.onShowWinnerPopup) {
        this.onShowWinnerPopup();
      }
    }
    console.log(this.winnerList, 'this.winnerList');

    // Remove winner form name list if necessary
    if (shouldRemoveWinner === true) {
      if (this.prizeNumber > 10) {
        for (let i = 0; i < 10; i++) {
          this.nameList.splice(
            this.nameList.findIndex(
              (name) => name === randomNames[randomNames.length - 1 - i]
            ),
            1
          );
        }
      } else {
        this.nameList.splice(
          this.nameList.findIndex(
            (name) => name === randomNames[randomNames.length - 1]
          ),
          1
        );
      }
    }

    console.log('Remaining: ', this.nameList);

    // Play the spin animation
    const animationPromise = new Promise((resolve) => {
      reelAnimation.onfinish = resolve;
    });

    reelAnimation.play();

    await animationPromise;

    // Sets the current playback time to the end of the animation
    // Fix issue for animatin not playing after the initial play on Safari
    reelAnimation.finish();

    Array.from(reelContainer.children)
      .slice(0, reelContainer.children.length - 1)
      .forEach((element) => element.remove());

    this.havePreviousWinner = true;

    if (this.onSpinEnd) {
      this.onSpinEnd();
    }

    if (this.prizeNumber > 10) {
      this.prizeNumber -= 10; // Increment prizeNumber by 10
    } else {
      this.prizeNumber -= 1; // Increment prizeNumber by 1
    }
    return true;
  }

  // Function to get the round index
  getRoundIndex() {
    return this.winnerList.findIndex((round) => round.setTitle === 'GRAND SET');
  }
}
