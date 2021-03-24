import {DynamoDbImage} from "../services/dynamodb-images";

export interface Brakes {
    brakeCodeOriginal?: string;
    brakeCode?: string;
    dataTrBrakeOne?: string;
    dataTrBrakeTwo?: string;
    dataTrBrakeThree?: string;
    retarderBrakeOne?: RetarderBrakeType;
    retarderBrakeTwo?: RetarderBrakeType;
    dtpNumber?: string;
    brakeForceWheelsNotLocked?: BrakeForceWheelsNotLocked;
    brakeForceWheelsUpToHalfLocked?: BrakeForceWheelsUpToHalfLocked;
    loadSensingValve?: boolean;
    antilockBrakingSystem?: boolean;
}

export type RetarderBrakeType = "electric" | "exhaust" | "friction" | "hydraulic" | "other" | "none";

export interface BrakeForceWheelsNotLocked {
    serviceBrakeForceA?: number;
    secondaryBrakeForceA?: number;
    parkingBrakeForceA?: number;
}

export interface BrakeForceWheelsUpToHalfLocked {
    serviceBrakeForceB?: number;
    secondaryBrakeForceB?: number;
    parkingBrakeForceB?: number;
}

export const parseBrakes = (brakes: DynamoDbImage): Brakes => {
    const brakeForceWheelsNotLockedImage: DynamoDbImage = brakes.getMap("brakeForceWheelsNotLocked");
    const brakeForceWheelsNotLocked: BrakeForceWheelsNotLocked = {
        serviceBrakeForceA: brakeForceWheelsNotLockedImage.getNumber("serviceBrakeForceA"),
        secondaryBrakeForceA: brakeForceWheelsNotLockedImage.getNumber("secondaryBrakeForceA"),
        parkingBrakeForceA: brakeForceWheelsNotLockedImage.getNumber("parkingBrakeForceA")
    };

    const brakeForceWheelsUpToHalfLockedImage: DynamoDbImage = brakes.getMap("brakeForceWheelsUpToHalfLocked");
    const brakeForceWheelsUpToHalfLocked: BrakeForceWheelsUpToHalfLocked = {
        serviceBrakeForceB: brakeForceWheelsUpToHalfLockedImage.getNumber("serviceBrakeForceB"),
        secondaryBrakeForceB: brakeForceWheelsUpToHalfLockedImage.getNumber("secondaryBrakeForceB"),
        parkingBrakeForceB: brakeForceWheelsUpToHalfLockedImage.getNumber("parkingBrakeForceB")
    };

    return {
        brakeCodeOriginal: brakes.getString("brakeCodeOriginal"),
        brakeCode: brakes.getString("brakeCode"),
        dataTrBrakeOne: brakes.getString("dataTrBrakeOne"),
        dataTrBrakeTwo: brakes.getString("dataTrBrakeTwo"),
        dataTrBrakeThree: brakes.getString("dataTrBrakeThree"),
        retarderBrakeOne: brakes.getString("retarderBrakeOne") as RetarderBrakeType,
        retarderBrakeTwo: brakes.getString("retarderBrakeTwo") as RetarderBrakeType,
        dtpNumber: brakes.getString("dtpNumber"),
        brakeForceWheelsNotLocked,
        brakeForceWheelsUpToHalfLocked,
        loadSensingValve: brakes.getBoolean("loadSensingValve"),
        antilockBrakingSystem: brakes.getBoolean("antilockBrakingSystem")
    };
};

export const toBrakesTemplateVariables = (brakes: Brakes): any[] => {
    const templateVariables: any[] = [];

    templateVariables.push(brakes.brakeCodeOriginal);
    templateVariables.push(brakes.brakeCode);
    templateVariables.push(brakes.dataTrBrakeOne);
    templateVariables.push(brakes.dataTrBrakeTwo);
    templateVariables.push(brakes.dataTrBrakeThree);
    templateVariables.push(brakes.retarderBrakeOne);
    templateVariables.push(brakes.retarderBrakeTwo);
    templateVariables.push(brakes.dtpNumber);
    templateVariables.push(brakes.loadSensingValve);
    templateVariables.push(brakes.antilockBrakingSystem);

    // TODO nullity checks here
    templateVariables.push(brakes.brakeForceWheelsNotLocked!.serviceBrakeForceA);
    templateVariables.push(brakes.brakeForceWheelsNotLocked!.secondaryBrakeForceA);
    templateVariables.push(brakes.brakeForceWheelsNotLocked!.parkingBrakeForceA);
    templateVariables.push(brakes.brakeForceWheelsUpToHalfLocked!.serviceBrakeForceB);
    templateVariables.push(brakes.brakeForceWheelsUpToHalfLocked!.secondaryBrakeForceB);
    templateVariables.push(brakes.brakeForceWheelsUpToHalfLocked!.parkingBrakeForceB);

    return templateVariables;
};
