import express from "express";
import prisma from "@repo/db";

const app = express();

app.post("/bankWebhook", async (req, res) => {
  // TODO: Check if this request came from the Bank Webhook

  const paymentInfo = {
    token: req.body.token,
    amount: req.body.amount,
    userId: req.body.userId,
  };

  try {
    await prisma.$transaction([
      prisma.balance.updateMany({
        where: { userId: paymentInfo.userId },
        data: {
          amount: { increment: paymentInfo.amount },
        },
      }),
      prisma.onRampTransaction.updateMany({
        where: { userId: paymentInfo.userId },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.status(200).json({
      message: "captured",
    });
  } catch (error) {
    res.status(411).json({
      messgae: "Error in saving transaction",
    });
  }
  res.status(200).send("ok");
});

app.listen(3003, () => {
  console.log("Server is running on port 3000");
});
