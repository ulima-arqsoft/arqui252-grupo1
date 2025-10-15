import 'dotenv/config';
import { Builder, By, until } from 'selenium-webdriver';

if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
  console.error("❌ ERROR: Faltan variables en .env");
  process.exit(1);
}
console.log(`✅ Variables cargadas: ${process.env.BROWSERSTACK_USERNAME} ***OK***`);

(async function testMobile() {
  let driver;
  try {
    const capabilities = {
      'bstack:options': {
        osVersion: "16",
        deviceName: "iPhone 14",
        realMobile: "true",
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      },
      browserName: "safari"
    };

    driver = await new Builder()
      .usingServer("https://hub-cloud.browserstack.com/wd/hub")
      .withCapabilities(capabilities)
      .build();

    console.log("📱 Abriendo Google en iPhone 14...");
    await driver.get("https://www.google.com");

    // Aceptar cookies si aparece (según región)
    try {
      let acceptButton = await driver.wait(
        until.elementLocated(By.xpath("//div[text()='Acepto todo' or text()='Aceptar todo' or text()='I agree']")),
        5000
      );
      await acceptButton.click();
      console.log("✅ Cookies aceptadas.");
    } catch {
      console.log("⚠️ No hubo cookies para aceptar (normal en móvil).");
    }

    console.log("🔎 Buscando 'Ulima Blackboard'...");
    const searchBox = await driver.findElement(By.name("q"));
    await searchBox.sendKeys("Ulima Blackboard");
    await searchBox.submit();

    console.log("⏳ Esperando resultados...");
    const ulimaLink = By.css("a[href*='ulima.blackboard']");
    const firstResult = await driver.wait(until.elementLocated(ulimaLink), 15000);

    console.log("✅ Resultado encontrado, entrando a Blackboard ULima...");
    await firstResult.click();

    console.log("🎓 ¡Se abrió Blackboard de la Universidad de Lima correctamente!");

  } catch (err) {
    console.error("❌ Error en la prueba:", err);
  } finally {
    if (driver) await driver.quit();
    console.log("🏁 Test finalizado");
  }
})();

