async function buildNoCompaniesShell() {
    let mainWrapper = document.querySelector('.shell2_main-wrapper');
    mainWrapper.insertAdjacentHTML('beforeend', await noCompaniesShell());
}

async function noCompaniesShell() {
    return `
    <div class="padding-horizontal padding-medium">
            <div class="section_shell2-layout not-categorized NoCompanies>
              <div class="padding-horizontal padding-medium">
                <div class="container-large">
                  <div class="padding-vertical padding-large padding-custom">
                    <div id="w-node-_1a30a1e4-8a69-abdf-86cf-348aa176e587-0240322d"
                      class="w-layout-grid shell2-layout_component">
                      <div class="stacked-list1_component currentItems">
                        <div class="stacked-list1_list-wrapper">
                          <h4 style="text-align: center; cursor: pointer;" onclick="location.replace('/dashboard/companies')">You haven't added any companies yet. Click here to add some! 📈✨ </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </div>
   `;
}

