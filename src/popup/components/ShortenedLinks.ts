/* eslint-disable no-underscore-dangle */
import { debounce } from "throttle-debounce";
import ServerReq from "@ServerReq";
import ext from "../../scripts/utils/ext";

class ShortenedLinks {
  $layout: JQuery<HTMLElement>;
  $searchInput: JQuery<HTMLElement>;
  $linksTBody: JQuery<HTMLElement>;

  constructor() {
    this.Render();
    this.FetchShortenedLinks();
    this.BindHandlers();
  }

  Render() {
    this.$layout = $(`
		<div id="shortenedLinks" class="column is-narrow">
			<article class="message is-black">
				<div class="message-header">
					<p>${System.data.locale.popup.shortenedLinks.text}</p>
				</div>
				<div class="message-body">
					<div class="field has-addons">
						<p class="control is-expanded">
							<input class="input" type="text" placeholder="${System.data.locale.popup.shortenedLinks.searchURL}">
						</p>
					</div>
					<div class="field is-horizontal">
						<div class="field-body">
							<table class="table table is-fullwidth links">
								<thead>
									<tr>
										<th>${System.data.locale.popup.shortenedLinks.originalURL}</th>
										<th>${System.data.locale.popup.shortenedLinks.created}</th>
										<th>${System.data.locale.popup.shortenedLinks.shortURL}</th>
									</tr>
								</thead>
								<tbody></tbody>
							</table>
						</div>
					</div>
				</div>
			</article>
		</div>`);

    this.$searchInput = $("input", this.$layout);
    this.$linksTBody = $("table.links > tbody", this.$layout);
  }

  async FetchShortenedLinks() {
    if ($("html").attr("is") === "popup") return;

    const resLinks = await new ServerReq().GetShortenedLinks();

    this.RenderLinks(resLinks);
  }

  RenderLinks(links) {
    if (
      links &&
      ((links.data && links.data.length > 0) ||
        (links instanceof Array && links.length > 0))
    ) {
      this.$linksTBody.html("");
      links.data.forEach(this.RenderLink.bind(this));
    }
  }

  RenderLink(link) {
    const shortURL = `${System.data.config.extension.shortenedLinkURL}/${link.shortCode}`;
    const $link = $(`
		<tr id="${link._id}">
			<td><a href="${link.originalURL}" target="_blank">${link.originalURL}</a></td>
			<td data-time="${link.time}"></td>
			<td><a href="${shortURL}" title="${shortURL}" target="_blank">${link.shortCode}</a></td>
		</tr>`);

    $link.appendTo(this.$linksTBody);
  }

  BindHandlers() {
    if ($("html").attr("is") === "popup") {
      this.$layout.on("click", function () {
        ext.runtime.openOptionsPage();
      });

      return;
    }

    this.$searchInput.on(
      "input",
      debounce(500, event => {
        this.FindLink(event.target.value);
      }),
    );

    this.$linksTBody.on("click", ">tr[id]", function () {
      this.classList.toggle("is-selected");
    });
  }

  async FindLink(value) {
    if (!value) {
      this.FetchShortenedLinks();
    } else {
      const resLinks = await new ServerReq().FindShortenedLink(value);

      this.RenderLinks(resLinks);
    }
  }
}

export default ShortenedLinks;
