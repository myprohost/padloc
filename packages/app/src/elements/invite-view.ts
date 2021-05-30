import { until } from "lit-html/directives/until";
import { translate as $l } from "@padloc/locale/src/translate";
import { formatDateFromNow } from "../lib/util";
import { shared } from "../styles";
import { app } from "../globals";
import { alert, confirm } from "../lib/dialog";
import { Routing } from "../mixins/routing";
import { StateMixin } from "../mixins/state";
import { Button } from "./button";
import "./icon";
import "./scroller";
import "./spinner";
import { UnlockedOrg } from "@padloc/core/src/org";
import { UnlockedAccount } from "@padloc/core/src/account";
import { customElement, property, query, state } from "lit/decorators";
import { css, html, LitElement } from "lit";

@customElement("pl-invite-view")
export class InviteView extends Routing(StateMixin(LitElement)) {
    readonly routePattern = /^orgs\/([^\/]+)\/invites(?:\/([^\/]+))?/;

    @property()
    inviteId: string;

    @property()
    orgId: string;

    @state()
    _secret?: Promise<string>;

    private get _org() {
        return app.getOrg(this.orgId);
    }

    private get _invite() {
        return this._org && this._org.getInvite(this.inviteId);
    }

    @query("#resendButton")
    private _resendButton: Button;

    @query("#deleteButton")
    private _deleteButton: Button;

    @query("#confirmButton")
    private _confirmButton: Button;

    handleRoute([orgId, inviteId]: [string, string]) {
        this.orgId = orgId;
        this.inviteId = inviteId;

        if (!this._org) {
            this.redirect("");
            return;
        }

        this._secret = (async () => {
            if (!this._invite || !this._org || !app.account || app.account.locked) {
                return "";
            }
            await this._org.unlock(app.account as UnlockedAccount);
            await this._invite.unlock((this._org as UnlockedOrg).invitesKey);
            return this._invite.secret!;
        })();
    }

    static styles = [
        shared,
        css`
            :host {
                position: relative;
                background: var(--color-background);
            }
        `,
    ];

    private async _delete() {
        if (this._deleteButton.state === "loading") {
            return;
        }

        if (
            !(await confirm($l("Are you sure you want to delete this invite?"), $l("Delete"), $l("Cancel"), {
                title: $l("Delete Invite"),
                type: "destructive",
            }))
        ) {
            return;
        }

        this._deleteButton.start();
        try {
            await app.deleteInvite(this._invite!);
            this._deleteButton.success();
            this.go(`orgs/${this.orgId}/invites`);
        } catch (e) {
            this._deleteButton.fail();
            alert(e.message, { type: "warning" });
        }
    }

    private async _resend() {
        if (!this._invite || !this._org || this._resendButton.state === "loading") {
            return;
        }
        this._resendButton.start();
        let org = this._org!;
        try {
            const newInvite = (await app.createInvites(org, [this._invite.email], this._invite.purpose))[0];
            this.go(`orgs/${this.orgId}/invites/${newInvite.id}`, undefined, true);
            this._resendButton.success();
        } catch (e) {
            this._resendButton.fail();
            alert(e.message, { type: "warning" });
        }
    }

    private async _confirm() {
        if (this._confirmButton.state === "loading") {
            return;
        }
        this._confirmButton.start();
        try {
            const member = await app.confirmInvite(this._invite!);
            this._confirmButton.success();

            this.go(`orgs/${this.orgId}/members/${member.id}`);
        } catch (e) {
            this._confirmButton.fail();
            alert(e.message, { type: "warning" });
            throw e;
        }
    }

    render() {
        if (!this._invite) {
            return html` <div class="fullbleed centering layout">${$l("No invite selected")}</div> `;
        }

        const { email, expires, expired, accepted, purpose } = this._invite!;

        const status = expired
            ? { icon: "time", class: "warning", text: $l("This invite has expired") }
            : accepted
            ? { icon: "check", class: "", text: $l("Accepted") }
            : {
                  icon: "time",
                  class: "",
                  text: until(
                      (async () => {
                          return $l("expires {0}", await formatDateFromNow(expires));
                      })()
                  ),
              };

        return html`
            <div class="fullbleed vertical layout">
                <header class="padded horizontal center-aligning layout">
                    <pl-button class="transparent back-button" @click=${() => this.go(`orgs/${this.orgId}/invites`)}>
                        <pl-icon icon="backward"></pl-icon>
                    </pl-button>

                    <div class="stretch large padded">${$l("Invite")}</div>

                    <div class="small tag ${status.class}">
                        <pl-icon icon="${status.icon}"></pl-icon>

                        <div>${status.text}</div>
                    </div>
                </header>

                <ptc-scroller class="stretch">
                    <div class="large spacer"></div>

                    <div class="margined text-centering">
                        ${$l(
                            purpose === "confirm_membership"
                                ? "A membership confirmation request was sent to:"
                                : "An invite was sent to:"
                        )}
                    </div>

                    <div class="bold large text-centering">${email}</div>

                    <div class="double-margined text-centering">
                        ${$l(
                            "They will also need the following confirmation code, which " +
                                "you should communicate to them separately:"
                        )}
                    </div>

                    <div class="giant centering double-margined padded layout mono card">
                        <div>${until(this._secret, html` <pl-spinner active></pl-spinner> `)}</div>
                    </div>

                    <div class="horziontal margined evenly stretching spacing horizontal layout">
                        ${accepted
                            ? html`
                                  <pl-button
                                      ?disabled=${expired}
                                      id="confirmButton"
                                      class="tap primary"
                                      @click=${() => this._confirm()}
                                  >
                                      <pl-icon icon="invite" class="right-margined"></pl-icon>

                                      <div>${$l(purpose === "confirm_membership" ? "Confirm" : "Add Member")}</div>
                                  </pl-button>
                              `
                            : html`
                                  <pl-button id="resendButton" class="tap" @click=${() => this._resend()}>
                                      <pl-icon icon="mail" class="right-margined"></pl-icon>

                                      <div>${$l("Resend")}</div>
                                  </pl-button>
                              `}

                        <pl-button id="deleteButton" class="tap negative" @click=${() => this._delete()}>
                            <pl-icon icon="delete" class="right-margined"></pl-icon>

                            <div>${$l("Delete")}</div>
                        </pl-button>
                    </div>
                </ptc-scroller>
            </div>
        `;
    }
}