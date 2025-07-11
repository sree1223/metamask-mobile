import { SkipAccountSecurityModalSelectorsIDs } from '../../selectors/Onboarding/SkipAccountSecurityModal.selectors';
import Gestures from '../../utils/Gestures';
import Matchers from '../../utils/Matchers';

class SkipAccountSecurityModal {
  get iUnderstandCheckbox() {
    return device.getPlatform() === 'android'
      ? Matchers.getElementByID(
          SkipAccountSecurityModalSelectorsIDs.ANDROID_SKIP_BACKUP_BUTTON_ID,
        )
      : Matchers.getElementByID(
          SkipAccountSecurityModalSelectorsIDs.iOS_SKIP_BACKUP_BUTTON_ID,
        );
  }

  get skipButton() {
    return Matchers.getElementByID(
      SkipAccountSecurityModalSelectorsIDs.SKIP_BUTTON,
    );
  }

  get cancelButton() {
    return Matchers.getElementByID(
      SkipAccountSecurityModalSelectorsIDs.CANCEL_BUTTON,
    );
  }

  async tapIUnderstandCheckBox() {
    await Gestures.waitAndTap(this.iUnderstandCheckbox);
  }

  async tapSkipButton() {
    await Gestures.waitAndTap(this.skipButton);
  }

  async tapCancelButton() {
    await Gestures.waitAndTap(this.cancelButton);
  }
}

export default new SkipAccountSecurityModal();
