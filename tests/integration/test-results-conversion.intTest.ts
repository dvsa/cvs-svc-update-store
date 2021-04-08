import {StartedTestContainer} from "testcontainers";
import {destroyConnectionPool, executeSql} from "../../src/services/connection-pool";
import {castToImageShape, useLocalDb} from "../utils";
import testResultsJson from "../resources/dynamodb-image-test-results.json";
import {DynamoDbImage} from "../../src/services/dynamodb-images";
import {getContainerizedDatabase} from "./cvsbnop-container";
import {TestResultUpsertResult} from "../../src/models/upsert-results";
import {convert} from "../../src/services/entity-conversion";

useLocalDb();

describe("convertTestResults() integration tests", () => {
    let container: StartedTestContainer;

    beforeAll(async () => {
        jest.setTimeout(60_000);
        container = await getContainerizedDatabase();
    });

    afterAll(async () => {
        await destroyConnectionPool();
        await container.stop();
    });

    it("should correctly convert a DynamoDB event into Aurora rows", async () => {
        const upsertResults: TestResultUpsertResult[] = await convert(
            "Test_Results",
            "INSERT",
            DynamoDbImage.parse(castToImageShape(testResultsJson))
        );

        expect(upsertResults.length).toEqual(1);

        const upsertResult = upsertResults[0];

        const vehicleResultSet = await executeSql(
            `SELECT \`system_number\` FROM \`vehicle\` WHERE \`vehicle\`.\`id\` = ${upsertResult.vehicleId}`
        );
        expect(vehicleResultSet.rows.length).toEqual(1);
        expect(vehicleResultSet.rows[0].system_number).toEqual("SYSTEM-NUMBER");

        const testStationResultSet = await executeSql(
            `SELECT \`pNumber\` FROM \`test_station\` WHERE \`test_station\`.\`id\` = ${upsertResult.testStationId}`
        );
        expect(testStationResultSet.rows.length).toEqual(1);
        expect(testStationResultSet.rows[0].pNumber).toEqual("P-NUMBER");

        const testerResultSet = await executeSql(
            `SELECT \`staffId\` FROM \`tester\` WHERE \`tester\`.\`id\` = ${upsertResult.testerId}`
        );
        expect(testerResultSet.rows.length).toEqual(1);
        expect(testerResultSet.rows[0].staffId).toEqual("999999999");

        const vehicleClassResultSet = await executeSql(
            `SELECT \`code\` FROM \`vehicle_class\` WHERE \`vehicle_class\`.\`id\` = ${upsertResult.vehicleClassId}`
        );
        expect(vehicleClassResultSet.rows.length).toEqual(1);
        expect(vehicleClassResultSet.rows[0].code).toEqual("2");

        const preparerResultSet = await executeSql(
            `SELECT \`preparerId\` FROM \`preparer\` WHERE \`preparer\`.\`id\` = ${upsertResult.preparerId}`
        );
        expect(preparerResultSet.rows.length).toEqual(1);
        expect(preparerResultSet.rows[0].preparerId).toEqual("999999999");

        const createdByResultSet = await executeSql(
            `SELECT \`identityId\` FROM \`identity\` WHERE \`identity\`.\`id\` = ${upsertResult.createdById}`
        );
        expect(createdByResultSet.rows.length).toEqual(1);
        expect(createdByResultSet.rows[0].identityId).toEqual("CREATED-BY-ID");

        const lastUpdatedByResultSet = await executeSql(
            `SELECT \`identityId\` FROM \`identity\` WHERE \`identity\`.\`id\` = ${upsertResult.lastUpdatedById}`
        );
        expect(lastUpdatedByResultSet.rows.length).toEqual(1);
        expect(lastUpdatedByResultSet.rows[0].identityId).toEqual("LAST-UPDATED-BY-ID");

        const fuelEmissionResultSet = await executeSql(
            `SELECT \`modTypeCode\` FROM \`fuel_emission\` WHERE \`fuel_emission\`.\`id\` = ${upsertResult.fuelEmissionId}`
        );
        expect(fuelEmissionResultSet.rows.length).toEqual(1);
        expect(fuelEmissionResultSet.rows[0].modTypeCode).toEqual("p");

        const testTypeResultSet = await executeSql(
            `SELECT \`testTypeName\`, \`testTypeClassification\` FROM \`test_type\` WHERE \`test_type\`.\`id\` = ${upsertResult.testTypeId}`
        );
        expect(testTypeResultSet.rows.length).toEqual(1);
        expect(testTypeResultSet.rows[0].testTypeClassification).toEqual("2323232323232323232323");

        expect(upsertResult.defectIds.length).toEqual(1);
        const defectResultSet = await executeSql(
            `SELECT \`imNumber\` FROM \`defect\` WHERE \`defect\`.\`id\` = ${upsertResult.defectIds[0]}`
        );
        expect(defectResultSet.rows.length).toEqual(1);
        expect(defectResultSet.rows[0].imNumber).toEqual(1);

        const testDefectResultSet = await executeSql(
            `SELECT \`test_result_id\`, \`defect_id\` FROM \`test_defect\` WHERE \`test_defect\`.\`test_result_id\` = ${upsertResult.testResultId}`
        );
        expect(testDefectResultSet.rows.length).toEqual(1);
        expect(testDefectResultSet.rows[0].test_result_id).toEqual(upsertResult.testResultId);
        expect(testDefectResultSet.rows[0].defect_id).toEqual(upsertResult.defectIds[0]);

        expect(upsertResult.customDefectIds.length).toEqual(1);
        const customDefectResultSet = await executeSql(
            `SELECT \`test_result_id\`, \`referenceNumber\` FROM \`custom_defect\` WHERE \`custom_defect\`.\`id\` = ${upsertResult.customDefectIds[0]}`
        );
        expect(customDefectResultSet.rows.length).toEqual(1);
        expect(customDefectResultSet.rows[0].test_result_id).toEqual(upsertResult.testResultId);
        expect(customDefectResultSet.rows[0].referenceNumber).toEqual("1010101010");
    });
});
