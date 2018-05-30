import '../../styles/shared.js';
import '../base/base.js';

class TitleBar extends padlock.BaseElement {
  static get template() {
    return Polymer.html`
        <style include="shared">
            :host {
                height: var(--title-bar-height);
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 10;
                -webkit-app-region: drag;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
            }

            .title {
                @apply --fullbleed;
                text-align: center;
                line-height: var(--title-bar-height);
                pointer-events: none;
                color: var(--color-background);
                font-size: var(--font-size-small);
                font-weight: bold;
            }

            .buttons {
                display: flex;
                align-items: center;
                @apply --fullbleed;
            }

            :host(:not(.macos):not(.linux)) .buttons.macos-linux,
            :host(:not(.windows)) .buttons.windows {
                display: none;
            }

            .buttons.windows {
                justify-content: flex-end;
            }

            .buttons.macos-linux button {
                width: 12px;
                height: 12px;
                padding: 0;
                border: solid 1px rgba(0, 0, 0, 0.05);
                box-sizing: border-box;
                border-radius: 100%;
                margin-left: 10px;
                font-size: 10px;
                font-family: "FontAwesome";
                text-align: center;
                position: relative;
                cursor: pointer;
                -webkit-app-region: no-drag;
            }

            .buttons.macos-linux button::after {
                width: 10px;
                height: 10px;
                line-height: 10px;
                @apply --absolute-center;
            }

            .buttons.macos-linux button:not(:hover)::after {
                opacity: 0;
            }

            .buttons.macos-linux button.close {
                background: #FF6058;
            }

            .buttons.macos-linux button.close::after {
                content: "\\f00d";
                font-size: 8px;
            }

            .buttons.macos-linux button.minimize {
                background: #FFBF2F;
            }

            .buttons.macos-linux button.minimize::after {
                content: "\\f2d1";
                font-size: 6px;
            }

            .buttons.macos-linux button.maximize {
                background: #28CA42;
                transform: rotate(45deg);
            }

            .buttons.macos-linux button.maximize::after {
                content: "\\f07d";
                font-size: 9px;
            }

            .buttons.windows button {
                color: var(--color-background);
                width: var(--title-bar-height);
                height: var(--title-bar-height);
                padding: 0;
                box-sizing: border-box;
                font-family: "FontAwesome";
                position: relative;
                cursor: pointer;
                -webkit-app-region: no-drag;
                line-height: var(--title-bar-height);
                text-align: center;
            }

            .buttons.windows button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .buttons.windows button.close::after {
                content: "\\f00d";
                font-size: 16px;
            }

            .buttons.windows button.close:hover {
                background: #FF6058;
            }

            .buttons.windows button.minimize::after {
                content: "\\f2d1";
                font-size: 12px;
            }

            .buttons.windows button.maximize::after {
                content: "\\f2d0";
                font-size: 14px;
            }
        </style>

        <div class="title">Padlock</div>

        <div class="buttons macos-linux">
            <button class="close" on-click="_close"></button>
            <button class="minimize" on-click="_minimize"></button>
            <button class="maximize" on-click="_maximize"></button>
        </div>

        <div class="buttons windows">
            <button class="minimize" on-click="_minimize"></button>
            <button class="maximize" on-click="_maximize"></button>
            <button class="close" on-click="_close"></button>
        </div>
`;
  }

  static get is() { return "pl-title-bar"; }

  _close() {
      require("electron").remote.getCurrentWindow().close();
  }

  _minimize() {
      require("electron").remote.getCurrentWindow().minimize();
  }

  _maximize() {
      var win = require("electron").remote.getCurrentWindow();
      win.setFullScreen(!win.isFullScreen());
  }
}

window.customElements.define(TitleBar.is, TitleBar);